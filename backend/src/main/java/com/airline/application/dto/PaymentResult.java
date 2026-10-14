package com.airline.application.dto;

import com.airline.domain.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResult(
        Long id,
        Long bookingId,
        BigDecimal amount,
        String paymentMethod,
        PaymentStatus status,
        String transactionRef,
        LocalDateTime paidAt,
        LocalDateTime createdAt) {}
