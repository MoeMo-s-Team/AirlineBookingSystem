package com.airline.presentation.dto.request;

import com.airline.domain.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateRequest {

    @NotNull(message = "Trạng thái booking không được để trống")
    private BookingStatus status;
}
