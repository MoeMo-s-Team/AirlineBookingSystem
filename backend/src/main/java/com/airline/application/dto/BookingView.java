package com.airline.application.dto;

import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record BookingView(
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

    public record FlightSummary(Long id, String flightNumber, String origin, String destination,
                                LocalDateTime departureTime) {}

    public record FareClassSummary(Long id, String code, String name) {}

    public record PassengerView(Long id, String fullName, LocalDate dateOfBirth, String passportNo) {}

    public record ServiceView(Long id, String name, Integer quantity, BigDecimal unitPrice) {}

    public record PriceBreakdown(BigDecimal baseFare, BigDecimal servicesTotal, BigDecimal total) {}

    public record PaymentSummary(Long id, BigDecimal amount, PaymentStatus status, LocalDateTime paidAt) {}
}
