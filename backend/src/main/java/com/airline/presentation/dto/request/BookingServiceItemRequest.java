package com.airline.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingServiceItemRequest {

    @NotNull(message = "Mã dịch vụ bổ sung không được để trống")
    private Long serviceId;

    @NotNull(message = "Số lượng dịch vụ không được để trống")
    @Positive(message = "Số lượng dịch vụ phải lớn hơn 0")
    private Integer quantity;
}
