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
public class PriceBreakdownResponse {
    private BigDecimal baseFare;
    private BigDecimal servicesTotal;
    private BigDecimal total;
}
