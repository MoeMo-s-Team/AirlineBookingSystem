package com.airline.presentation.dto.response;

import com.airline.domain.enums.BookingStatus;
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
public class BookingDetailResponse {
    private Long id;
    private String bookingCode;
    private BookingStatus status;
    private FlightResponse flight;
    private FareClassResponse fareClass;
    private List<PassengerResponse> passengers;
    private List<BookingServiceItemResponse> services;
    private PriceBreakdownResponse priceBreakdown;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
