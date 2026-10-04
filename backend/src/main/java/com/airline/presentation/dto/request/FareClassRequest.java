package com.airline.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareClassRequest {

    @NotBlank(message = "Mã hạng vé không được để trống")
    @Size(max = 20, message = "Mã hạng vé tối đa 20 ký tự")
    private String code;

    @NotBlank(message = "Tên hạng vé không được để trống")
    @Size(max = 100, message = "Tên hạng vé tối đa 100 ký tự")
    private String name;

    @NotNull(message = "Hệ số nhân giá không được để trống")
    @DecimalMin(value = "0.01", message = "Hệ số nhân giá phải lớn hơn 0")
    private BigDecimal priceMultiplier;

    @Builder.Default
    private Boolean active = true;
}
