package com.airline.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingRequest {

    @NotNull(message = "ID chuyến bay không được để trống")
    private Long flightId;

    @NotNull(message = "ID hạng vé không được để trống")
    private Long fareClassId;

    @Valid
    @NotEmpty(message = "Booking phải có ít nhất một hành khách")
    private List<PassengerRequest> passengers;

    @Valid
    private List<BookingServiceRequest> services;
}
