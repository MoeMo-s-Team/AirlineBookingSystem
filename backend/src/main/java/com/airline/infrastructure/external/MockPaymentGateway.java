package com.airline.infrastructure.external;

import com.airline.application.service.PaymentGateway;
import com.airline.domain.enums.PaymentStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MockPaymentGateway implements PaymentGateway {

    private final PaymentStatus defaultStatus;

    public MockPaymentGateway(
            @Value("${booking.payment.mock-result:SUCCESS}") String mockResult) {
        if ("FAILED".equalsIgnoreCase(mockResult)) {
            this.defaultStatus = PaymentStatus.FAILED;
        } else {
            this.defaultStatus = PaymentStatus.SUCCESS;
        }
    }

    @Override
    public PaymentStatus processPayment(Long bookingId, String paymentMethod) {
        return defaultStatus;
    }
}
