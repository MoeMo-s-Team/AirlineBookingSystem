package com.airline.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {

    @NotNull(message = "Mã chuyến bay không được để trống")
    private Long flightId;

    @NotNull(message = "Mã hạng vé không được để trống")
    private Long fareClassId;

    @NotEmpty(message = "Danh sách hành khách không được để trống")
    @Valid
    @Builder.Default
    private List<PassengerRequest> passengers = new ArrayList<>();

    @Valid
    @Builder.Default
    private List<BookingServiceItemRequest> services = new ArrayList<>();
}
