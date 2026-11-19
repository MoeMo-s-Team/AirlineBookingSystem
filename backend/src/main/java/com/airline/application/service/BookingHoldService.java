package com.airline.application.service;

import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Flight;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.pattern.observer.BookingSubject;
import com.airline.pattern.state.BookingStateContext;
import com.airline.presentation.exception.ResourceNotFoundException;
import java.time.Clock;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingHoldService {
    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final BookingSubject bookingSubject;
    private final Clock bookingClock;

    public LocalDateTime now() {
        return LocalDateTime.now(bookingClock);
    }

    // Caller holds the flight write lock throughout the booking transaction.
    public LocalDateTime reserve(Flight flight, int passengers) {
        LocalDateTime now = now();
        if (flight.getStatus() == com.airline.domain.enums.FlightStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot book a cancelled flight.");
        }
        if (!flight.getDepartureTime().isAfter(now)) {
            throw new IllegalArgumentException("Cannot book a flight that has already departed");
        }
        if (passengers <= 0 || flight.getAvailableSeats() < passengers) {
            throw new IllegalArgumentException("Insufficient Seats");
        }
        flight.setAvailableSeats(flight.getAvailableSeats() - passengers);
        LocalDateTime limit = now.plusMinutes(15);
        return flight.getDepartureTime().isBefore(limit) ? flight.getDepartureTime() : limit;
    }

    // Caller holds the booking write lock; the marker prevents double refunds.
    public void release(Booking booking) {
        if (!booking.isSeatsHeld()) return;
        java.util.stream.Stream.of(booking.getFlight(), booking.getReturnFlight())
                .filter(java.util.Objects::nonNull).map(Flight::getId).distinct().sorted().forEach(id -> {
                    Flight flight = flightRepository.findByIdForUpdate(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Flight not found"));
                    flight.setAvailableSeats(flight.getAvailableSeats() + booking.getPassengers().size());
                });
        booking.setSeatsHeld(false);
    }

    public boolean expireIfNecessary(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) return false;
        boolean unavailableFlight = java.util.stream.Stream.of(booking.getFlight(), booking.getReturnFlight())
                .filter(java.util.Objects::nonNull)
                .anyMatch(flight -> flight.getStatus() == com.airline.domain.enums.FlightStatus.CANCELLED
                        || (flight.getDepartureTime() != null && !flight.getDepartureTime().isAfter(now())));
        if (!unavailableFlight && (booking.getExpiresAt() == null || booking.getExpiresAt().isAfter(now()))) return false;
        BookingStateContext state = new BookingStateContext(booking.getStatus());
        state.cancel();
        release(booking);
        booking.setStatus(state.getStatus());
        bookingRepository.save(booking);
        bookingSubject.publishStatusChanged(booking, BookingStatus.PENDING);
        return true;
    }

    // Booking is locked first; flight rows are then locked in ID order, just as seat release.
    public void lockFlightsForPayment(Booking booking) {
        java.util.stream.Stream.of(booking.getFlight(), booking.getReturnFlight())
                .filter(java.util.Objects::nonNull).map(Flight::getId).distinct().sorted()
                .forEach(id -> flightRepository.findByIdForUpdate(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Flight not found")));
    }

    @Transactional
    public void expireBooking(Long id) {
        bookingRepository.findByIdForUpdate(id).ifPresent(this::expireIfNecessary);
    }
}
