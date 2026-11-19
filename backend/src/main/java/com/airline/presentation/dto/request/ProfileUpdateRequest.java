package com.airline.presentation.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;
import lombok.Data;

@Data
public class ProfileUpdateRequest {
    @NotBlank
    @Size(min = 2, max = 255)
    private String fullName;

    @Size(max = 20)
    private String phone;

    @PastOrPresent
    private LocalDate dateOfBirth;

    @Size(max = 50)
    private String passportNo;
}
