package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.service.PaymentService;
import com.airline.domain.enums.PaymentStatus;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.PaymentResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

        PaymentResponse mockResponse = PaymentResponse.builder()
                .id(1L)
                .bookingId(10L)
                .amount(new BigDecimal("1500000.00"))
                .paymentMethod("CREDIT_CARD")
                .status(PaymentStatus.SUCCESS)
                .transactionRef("TXN_123456")
                .paidAt(LocalDateTime.now())
                .build();

        when(paymentService.processPayment(customerPrincipal, request)).thenReturn(mockResponse);

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

        PaymentResponse mockResponse = PaymentResponse.builder()
                .id(2L)
                .bookingId(10L)
                .amount(new BigDecimal("1500000.00"))
                .paymentMethod("CREDIT_CARD")
                .status(PaymentStatus.FAILED)
                .build();

        when(paymentService.processPayment(customerPrincipal, request)).thenReturn(mockResponse);

        ResponseEntity<ApiResponse<PaymentResponse>> response = controller.processPayment(customerPrincipal, request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(PaymentStatus.FAILED, response.getBody().getData().getStatus());
    }
}
