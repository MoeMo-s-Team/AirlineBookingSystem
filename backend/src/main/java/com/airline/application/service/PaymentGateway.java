package com.airline.application.service;

import com.airline.domain.enums.PaymentStatus;

public interface PaymentGateway {
    PaymentStatus processPayment(Long bookingId, String paymentMethod);
}
