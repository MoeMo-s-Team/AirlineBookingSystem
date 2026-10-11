package com.airline.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingServiceItemResponse {
    private Long serviceId;
    private String name;
    private Integer quantity;
    private BigDecimal unitPrice;
}
