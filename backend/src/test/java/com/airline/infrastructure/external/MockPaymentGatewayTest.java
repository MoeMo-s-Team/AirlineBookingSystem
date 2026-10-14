package com.airline.infrastructure.external;

import com.airline.domain.enums.PaymentStatus;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class MockPaymentGatewayTest {

    @Test
    void defaultResult_isSuccess() {
        MockPaymentGateway gateway = new MockPaymentGateway("SUCCESS");
        PaymentStatus status = gateway.processPayment(1L, "CREDIT_CARD");
        assertEquals(PaymentStatus.SUCCESS, status);
    }

    @Test
    void failedConfig_returnsFailed() {
        MockPaymentGateway gateway = new MockPaymentGateway("FAILED");
        PaymentStatus status = gateway.processPayment(1L, "CREDIT_CARD");
        assertEquals(PaymentStatus.FAILED, status);
    }

    @Test
    void nullConfig_defaultsToSuccess() {
        MockPaymentGateway gateway = new MockPaymentGateway(null);
        PaymentStatus status = gateway.processPayment(1L, "CREDIT_CARD");
        assertEquals(PaymentStatus.SUCCESS, status);
    }
}
