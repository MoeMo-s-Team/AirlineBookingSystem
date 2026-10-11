package com.airline.presentation.controller;

import com.airline.application.service.PaymentService;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.PaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "API thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Thực hiện thanh toán (mock)")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            Authentication authentication,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                paymentService.processPayment(currentUserId(authentication), request)));
    }

    private UUID currentUserId(Authentication authentication) {
        try {
            return UUID.fromString(authentication.getName());
        } catch (RuntimeException ex) {
            throw new IllegalArgumentException("JWT subject không hợp lệ");
        }
    }
}
