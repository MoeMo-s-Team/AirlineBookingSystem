package com.airline.infrastructure.external;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class MockPaymentGatewayTest {

    private final MockPaymentGateway gateway = new MockPaymentGateway();

    @Test
    void supportedMethodsMapToExpectedMockOutcomes() {
        var card = gateway.processPayment("CREDIT_CARD", BigDecimal.ONE);
        var transfer = gateway.processPayment("BANK_TRANSFER", BigDecimal.ONE);
        var mock = gateway.processPayment("MOCK", BigDecimal.ONE);

        assertThat(card.successful()).isTrue();
        assertThat(card.transactionRef()).matches("TXN-[0-9a-f-]{36}");
        assertThat(transfer.successful()).isTrue();
        assertThat(transfer.transactionRef()).matches("TXN-[0-9a-f-]{36}");
        assertThat(mock.successful()).isFalse();
        assertThat(mock.transactionRef()).isNull();
    }
}
