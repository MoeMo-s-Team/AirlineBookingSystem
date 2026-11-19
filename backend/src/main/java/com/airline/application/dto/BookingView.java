package com.airline.application.dto;

import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record BookingView(
        Long id,
        String bookingCode,
        BookingStatus status,
        UserSummary user,
        FlightSummary flight,
        FareClassSummary fareClass,
        List<PassengerView> passengers,
        List<ServiceView> services,
        PriceBreakdown priceBreakdown,
        BigDecimal totalPrice,
        PaymentSummary payment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime expiresAt,
        FlightSummary returnFlight,
        FareClassSummary returnFareClass) {

    public BookingView(
            Long id,
            String bookingCode,
            BookingStatus status,
            FlightSummary flight,
            FareClassSummary fareClass,
            List<PassengerView> passengers,
            List<ServiceView> services,
            PriceBreakdown priceBreakdown,
            BigDecimal totalPrice,
            PaymentSummary payment,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
        this(id, bookingCode, status, null, flight, fareClass, passengers, services, priceBreakdown, totalPrice, payment, createdAt, updatedAt, null, null, null);
    }

    public record UserSummary(UUID id, String fullName, String email) {}

    public record FlightSummary(Long id, String flightNumber, String origin, String destination,
                                LocalDateTime departureTime, com.airline.domain.enums.FlightStatus status, LocalDateTime arrivalTime) {
        public FlightSummary(Long id, String flightNumber, String origin, String destination,
                             LocalDateTime departureTime, com.airline.domain.enums.FlightStatus status) {
            this(id, flightNumber, origin, destination, departureTime, status, null);
        }
        public FlightSummary(Long id, String flightNumber, String origin, String destination, LocalDateTime departureTime) {
            this(id, flightNumber, origin, destination, departureTime, com.airline.domain.enums.FlightStatus.SCHEDULED, null);
        }
    }

    public record FareClassSummary(Long id, String code, String name) {}

    public record PassengerView(Long id, String fullName, LocalDate dateOfBirth, String passportNo) {}

    public record ServiceView(Long id, String name, Integer quantity, BigDecimal unitPrice) {}

    public record PriceBreakdown(BigDecimal baseFare, BigDecimal servicesTotal, BigDecimal total, BigDecimal discount) {
        public PriceBreakdown(BigDecimal baseFare, BigDecimal servicesTotal, BigDecimal total) {
            this(baseFare, servicesTotal, total, BigDecimal.ZERO);
        }
    }

    public record PaymentSummary(Long id, BigDecimal amount, PaymentStatus status, LocalDateTime paidAt) {}
}
