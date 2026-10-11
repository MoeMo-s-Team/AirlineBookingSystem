package com.airline.infrastructure.external;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class MockPaymentGateway {

    public PaymentResult processPayment(String paymentMethod, BigDecimal amount) {
        return switch (paymentMethod) {
            case "CREDIT_CARD", "BANK_TRANSFER" -> new PaymentResult(true, "TXN-" + UUID.randomUUID());
            case "MOCK" -> new PaymentResult(false, null);
            default -> throw new IllegalArgumentException("Phương thức thanh toán không hợp lệ");
        };
    }

    public record PaymentResult(boolean successful, String transactionRef) {
    }
}
