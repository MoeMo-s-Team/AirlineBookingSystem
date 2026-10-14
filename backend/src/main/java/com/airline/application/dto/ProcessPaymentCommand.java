package com.airline.application.dto;

public record ProcessPaymentCommand(Long bookingId, String paymentMethod) {}
