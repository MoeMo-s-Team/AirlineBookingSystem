package com.airline.presentation.dto.request;

import com.airline.domain.enums.ServiceType;
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
public class ServiceRequest {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Size(max = 100, message = "Tên dịch vụ tối đa 100 ký tự")
    private String name;

    @NotNull(message = "Loại dịch vụ không được để trống (BAGGAGE, MEAL, SEAT, PRIORITY_BOARDING)")
    private ServiceType type;

    @NotNull(message = "Giá dịch vụ không được để trống")
    @DecimalMin(value = "0.0", message = "Giá dịch vụ không được âm")
    private BigDecimal price;

    @Builder.Default
    private Boolean active = true;
}
