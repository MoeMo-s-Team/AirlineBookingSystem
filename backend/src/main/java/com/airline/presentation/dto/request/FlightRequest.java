package com.airline.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightRequest {

    @NotBlank(message = "Số hiệu chuyến bay không được để trống")
    @Size(max = 20, message = "Số hiệu chuyến bay tối đa 20 ký tự")
    private String flightNumber;

    @NotBlank(message = "Mã sân bay đi không được để trống")
    @Pattern(regexp = "[A-Za-z]{3}", message = "Mã sân bay đi phải gồm đúng 3 chữ cái")
    private String origin;

    @NotBlank(message = "Mã sân bay đến không được để trống")
    @Pattern(regexp = "[A-Za-z]{3}", message = "Mã sân bay đến phải gồm đúng 3 chữ cái")
    private String destination;

    @NotNull(message = "Thời gian khởi hành không được để trống")
    @Future(message = "Thời gian khởi hành phải ở tương lai")
    private LocalDateTime departureTime;

    @NotNull(message = "Thời gian đến không được để trống")
    private LocalDateTime arrivalTime;

    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0.01", message = "Giá cơ bản phải lớn hơn 0")
    private BigDecimal basePrice;

    @NotNull(message = "Số ghế còn lại không được để trống")
    @Positive(message = "Số ghế còn lại phải lớn hơn 0")
    private Integer availableSeats;
}
