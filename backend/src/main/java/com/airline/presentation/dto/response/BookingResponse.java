package com.airline.presentation.dto.response;

import com.airline.application.dto.BookingView;
import com.airline.domain.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private BookingStatus status;
    private BookingView.UserSummary user;
    private BookingView.FlightSummary flight;
    private BookingView.FareClassSummary fareClass;
    private BookingView.FlightSummary returnFlight;
    private BookingView.FareClassSummary returnFareClass;
    private List<BookingView.PassengerView> passengers;
    private List<BookingView.ServiceView> services;
    private BookingView.PriceBreakdown priceBreakdown;
    private BigDecimal totalPrice;
    private BookingView.PaymentSummary payment;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.time.OffsetDateTime expiresAt;
    private java.time.OffsetDateTime serverTime;

    public static BookingResponse from(BookingView view) {
        return BookingResponse.builder()
                .id(view.id())
                .bookingCode(view.bookingCode())
                .status(view.status())
                .user(view.user())
                .flight(view.flight())
                .fareClass(view.fareClass())
                .returnFlight(view.returnFlight())
                .returnFareClass(view.returnFareClass())
                .passengers(view.passengers())
                .services(view.services())
                .priceBreakdown(view.priceBreakdown())
                .totalPrice(view.totalPrice())
                .payment(view.payment())
                .createdAt(view.createdAt())
                .updatedAt(view.updatedAt())
                .expiresAt(view.expiresAt() == null ? null : view.expiresAt()
                        .atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).toOffsetDateTime())
                .serverTime(java.time.OffsetDateTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")))
                .build();
    }
}
