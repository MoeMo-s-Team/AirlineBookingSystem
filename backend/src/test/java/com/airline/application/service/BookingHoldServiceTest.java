package com.airline.application.service;

import com.airline.domain.entity.*;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.*;
import com.airline.pattern.observer.BookingSubject;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingHoldServiceTest {
    private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-12-01T03:00:00Z"), ZoneId.of("Asia/Ho_Chi_Minh"));
    private static final LocalDateTime NOW = LocalDateTime.now(CLOCK);
    @Mock FlightRepository flights;
    @Mock BookingRepository bookings;
    @Mock BookingSubject subject;
    BookingHoldService holds;

    @BeforeEach void setUp() {
        holds = new BookingHoldService(flights, bookings, subject, CLOCK);
    }

    Flight flight(int seats) {
        return Flight.builder().id(1L).availableSeats(seats).departureTime(NOW.plusDays(1)).build();
    }

    Booking heldBooking(Flight flight) {
        return Booking.builder().id(2L).flight(flight).status(BookingStatus.PENDING).seatsHeld(true)
                .expiresAt(NOW.plusMinutes(15))
                .passengers(List.of(Passenger.builder().build(), Passenger.builder().build())).build();
    }

    @Test void reservesOneSeatPerPassengerForFifteenMinutes() {
        Flight flight = flight(3);
        assertThat(holds.reserve(flight, 2)).isEqualTo(NOW.plusMinutes(15));
        assertThat(flight.getAvailableSeats()).isEqualTo(1);
    }

    @Test void insufficientSeatsDoesNotChangeInventory() {
        Flight flight = flight(1);
        assertThatThrownBy(() -> holds.reserve(flight, 2)).isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Insufficient Seats");
        assertThat(flight.getAvailableSeats()).isEqualTo(1);
    }

    @Test void rejectsDepartedFlightsAndCapsHoldAtDeparture() {
        Flight flight = flight(2);
        flight.setDepartureTime(NOW);
        assertThatThrownBy(() -> holds.reserve(flight, 1)).isInstanceOf(IllegalArgumentException.class);
        flight.setDepartureTime(NOW.plusMinutes(5));
        assertThat(holds.reserve(flight, 1)).isEqualTo(NOW.plusMinutes(5));
    }

    @Test void releaseRefundsExactlyOnce() {
        Flight flight = flight(1);
        Booking booking = heldBooking(flight);
        when(flights.findByIdForUpdate(1L)).thenReturn(Optional.of(flight));
        holds.release(booking);
        holds.release(booking);
        assertThat(flight.getAvailableSeats()).isEqualTo(3);
        assertThat(booking.isSeatsHeld()).isFalse();
        verify(flights, times(1)).findByIdForUpdate(1L);
    }

    @Test void expiresAtExactDeadlineCancelsAndRefundsOnce() {
        Flight flight = flight(1);
        Booking booking = heldBooking(flight);
        booking.setExpiresAt(NOW);
        when(flights.findByIdForUpdate(1L)).thenReturn(Optional.of(flight));
        assertThat(holds.expireIfNecessary(booking)).isTrue();
        assertThat(holds.expireIfNecessary(booking)).isFalse();
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(flight.getAvailableSeats()).isEqualTo(3);
        verify(bookings).save(booking);
        verify(subject).publishStatusChanged(booking, BookingStatus.PENDING);
    }

    @Test void leavesUnexpiredBookingAlone() {
        assertThat(holds.expireIfNecessary(heldBooking(flight(1)))).isFalse();
        verifyNoInteractions(flights, bookings, subject);
    }

    @ParameterizedTest
    @EnumSource(value = BookingStatus.class, names = {"CONFIRMED", "CANCELLED", "PAYMENT_FAILED"})
    void cleanupNeverChangesTerminalBookings(BookingStatus status) {
        Booking booking = heldBooking(flight(1));
        booking.setStatus(status);
        booking.setExpiresAt(NOW.minusHours(1));
        assertThat(holds.expireIfNecessary(booking)).isFalse();
        verifyNoInteractions(flights, bookings, subject);
    }

    @Test void legacyExpiredBookingIsCancelledWithoutRefundingUnreservedSeats() {
        Booking booking = heldBooking(flight(1));
        booking.setSeatsHeld(false);
        booking.setExpiresAt(NOW.minusMinutes(1));
        assertThat(holds.expireIfNecessary(booking)).isTrue();
        verifyNoInteractions(flights);
        verify(bookings).save(booking);
    }

    @Test void schedulerRechecksUnderBookingLock() {
        Booking booking = heldBooking(flight(1));
        booking.setStatus(BookingStatus.CONFIRMED);
        when(bookings.findByIdForUpdate(2L)).thenReturn(Optional.of(booking));
        holds.expireBooking(2L);
        verify(bookings).findByIdForUpdate(2L);
        verifyNoInteractions(flights, subject);
    }

    @Test void rejectsCancelledFlightBeforeReservingSeats() {
        Flight flight = flight(2); flight.setStatus(com.airline.domain.enums.FlightStatus.CANCELLED);
        assertThatThrownBy(() -> holds.reserve(flight, 1)).isInstanceOf(IllegalArgumentException.class);
        assertThat(flight.getAvailableSeats()).isEqualTo(2);
    }

    @Test void cancelsPendingBookingAndRefundsSeatsWhenFlightIsCancelledBeforeExpiry() {
        Flight flight = flight(1); flight.setStatus(com.airline.domain.enums.FlightStatus.CANCELLED);
        Booking booking = heldBooking(flight);
        when(flights.findByIdForUpdate(1L)).thenReturn(Optional.of(flight));
        assertThat(holds.expireIfNecessary(booking)).isTrue();
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(flight.getAvailableSeats()).isEqualTo(3);
    }

    @Test void pendingBookingCannotBePaidAfterRescheduledDepartureEvenBeforeOriginalExpiry() {
        Flight flight = flight(1); flight.setDepartureTime(NOW);
        Booking booking = heldBooking(flight);
        when(flights.findByIdForUpdate(1L)).thenReturn(Optional.of(flight));
        assertThat(holds.expireIfNecessary(booking)).isTrue();
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }
}
