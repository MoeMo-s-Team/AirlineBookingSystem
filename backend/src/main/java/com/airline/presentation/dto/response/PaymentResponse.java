package com.airline.presentation.dto.response;

import com.airline.application.dto.PaymentResult;
import com.airline.domain.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long bookingId;
    private BigDecimal amount;
    private String paymentMethod;
    private PaymentStatus status;
    private String transactionRef;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;

    public static PaymentResponse from(PaymentResult result) {
        return PaymentResponse.builder()
                .id(result.id())
                .bookingId(result.bookingId())
                .amount(result.amount())
                .paymentMethod(result.paymentMethod())
                .status(result.status())
                .transactionRef(result.transactionRef())
                .paidAt(result.paidAt())
                .createdAt(result.createdAt())
                .build();
    }
}
