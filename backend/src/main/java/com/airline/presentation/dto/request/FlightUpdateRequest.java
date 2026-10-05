package com.airline.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
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
public class FlightUpdateRequest {

    @Size(min = 1, max = 20, message = "Số hiệu chuyến bay phải có từ 1 đến 20 ký tự")
    private String flightNumber;

    @Pattern(regexp = "[A-Za-z]{3}", message = "Mã sân bay đi phải gồm đúng 3 chữ cái")
    private String origin;

    @Pattern(regexp = "[A-Za-z]{3}", message = "Mã sân bay đến phải gồm đúng 3 chữ cái")
    private String destination;

    @Future(message = "Thời gian khởi hành phải ở tương lai")
    private LocalDateTime departureTime;

    private LocalDateTime arrivalTime;

    @DecimalMin(value = "0.01", message = "Giá cơ bản phải lớn hơn 0")
    private BigDecimal basePrice;

    @Positive(message = "Số ghế còn lại phải lớn hơn 0")
    private Integer availableSeats;
}
