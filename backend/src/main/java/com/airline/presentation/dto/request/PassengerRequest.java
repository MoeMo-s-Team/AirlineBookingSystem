package com.airline.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerRequest {

    @NotBlank(message = "Họ và tên hành khách không được để trống")
    @Size(max = 255, message = "Họ và tên hành khách tối đa 255 ký tự")
    private String fullName;

    @NotNull(message = "Ngày sinh không được để trống")
    @Past(message = "Ngày sinh phải ở quá khứ")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Số hộ chiếu/CCCD không được để trống")
    @Size(max = 50, message = "Số hộ chiếu/CCCD tối đa 50 ký tự")
    private String passportNo;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9+()\\s.-]{7,20}$", message = "Số điện thoại không đúng định dạng")
    private String phone;
}
