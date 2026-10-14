package com.airline.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Mã đơn đặt vé không được để trống")
    private Long bookingId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Pattern(regexp = "^(CREDIT_CARD|BANK_TRANSFER|MOCK)$", message = "Phương thức thanh toán không hợp lệ")
    private String paymentMethod;
}
