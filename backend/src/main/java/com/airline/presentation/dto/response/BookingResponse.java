package com.airline.presentation.dto.response;

import com.airline.domain.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private UUID userId;
    private Long flightId;
    private String flightNumber;
    private Long fareClassId;
    private String fareClassName;
    private BookingStatus status;
    private BigDecimal totalPrice;
    @Builder.Default
    private List<PassengerResponse> passengers = new ArrayList<>();
    @Builder.Default
    private List<BookingServiceItemResponse> services = new ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
