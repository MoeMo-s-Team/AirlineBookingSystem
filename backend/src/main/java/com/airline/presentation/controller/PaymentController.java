package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.ProcessPaymentCommand;
import com.airline.application.service.PaymentService;
import com.airline.presentation.dto.request.PaymentRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.PaymentResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "APIs thanh toán đơn đặt vé máy bay")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    @Operation(summary = "Thanh toán đơn đặt vé ở trạng thái PENDING (Customer)")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(
            @AuthenticationPrincipal ProfileIdentity principal,
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = PaymentResponse.from(paymentService.processPayment(principal,
                new ProcessPaymentCommand(request.getBookingId(), request.getPaymentMethod())));
        return ResponseEntity.ok(ApiResponse.success("Xử lý thanh toán thành công", response));
    }
}
