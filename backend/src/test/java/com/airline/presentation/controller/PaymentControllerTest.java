package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.PaymentResult;
import com.airline.application.dto.ProcessPaymentCommand;
import com.airline.application.service.PaymentService;
import com.airline.domain.enums.PaymentStatus;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.PaymentResponse;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {
    private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

    @Mock
    private PaymentService paymentService;

    private PaymentController controller;
    private ProfileIdentity customerPrincipal;
    private UUID userId;

    @BeforeEach
    void setUp() {
        controller = new PaymentController(paymentService);
        userId = UUID.randomUUID();
        customerPrincipal = ProfileIdentity.builder()
                .id(userId)
                .email("user@test.com")
                .role("CUSTOMER")
                .build();
    }

    @Test
    void processPayment_returnsOk_onSuccess() {
        PaymentRequest request = PaymentRequest.builder()
                .bookingId(10L)
                .paymentMethod("CREDIT_CARD")
                .build();

        PaymentResult mockResponse = new PaymentResult(1L, 10L, new BigDecimal("1500000.00"), "CREDIT_CARD",
                PaymentStatus.SUCCESS, "TXN_123456", LocalDateTime.now(), null);

        when(paymentService.processPayment(eq(customerPrincipal), any(ProcessPaymentCommand.class))).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<PaymentResponse>> response = controller.processPayment(customerPrincipal, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(PaymentStatus.SUCCESS, response.getBody().getData().getStatus());
    }

    @Test
    void processPayment_returnsOk_onFailedStatus() {
        PaymentRequest request = PaymentRequest.builder()
                .bookingId(10L)
                .paymentMethod("CREDIT_CARD")
                .build();

        PaymentResult mockResponse = new PaymentResult(2L, 10L, new BigDecimal("1500000.00"), "CREDIT_CARD",
                PaymentStatus.FAILED, null, null, null);

        when(paymentService.processPayment(eq(customerPrincipal), any(ProcessPaymentCommand.class))).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<PaymentResponse>> response = controller.processPayment(customerPrincipal, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(PaymentStatus.FAILED, response.getBody().getData().getStatus());
    }

    @ParameterizedTest
    @ValueSource(strings = {"CREDIT_CARD", "BANK_TRANSFER", "MOCK"})
    void paymentRequest_acceptsMethodsFromSrs(String method) {
        assertTrue(validator.validate(new PaymentRequest(10L, method)).isEmpty());
    }

    @ParameterizedTest
    @ValueSource(strings = {"DEBIT_CARD", "E_WALLET", "UNKNOWN", ""})
    void paymentRequest_rejectsMethodsOutsideSrs(String method) {
        assertFalse(validator.validate(new PaymentRequest(10L, method)).isEmpty());
    }
}
