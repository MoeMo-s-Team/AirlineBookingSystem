package com.airline.presentation.controller;

import com.airline.application.service.PaymentService;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.dto.response.PaymentResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentControllerTest {

    private static final UUID USER_ID = UUID.fromString("72a8b0a7-d05d-4a29-82b5-bdc6ef826a1c");

    @Mock
    private PaymentService paymentService;

    private PaymentController controller;

    @BeforeEach
    void setUp() {
        controller = new PaymentController(paymentService);
    }

    @Test
    void processPaymentForwardsAuthenticatedUser() {
        PaymentRequest request = PaymentRequest.builder().bookingId(10L).paymentMethod("MOCK").build();
        PaymentResponse payment = PaymentResponse.builder().bookingId(10L).build();
        when(paymentService.processPayment(USER_ID, request)).thenReturn(payment);

        var response = controller.processPayment(authentication(), request);

        assertThat(response.getBody().getData()).isSameAs(payment);
        verify(paymentService).processPayment(USER_ID, request);
    }

    private UsernamePasswordAuthenticationToken authentication() {
        return new UsernamePasswordAuthenticationToken(USER_ID.toString(), null);
    }
}
