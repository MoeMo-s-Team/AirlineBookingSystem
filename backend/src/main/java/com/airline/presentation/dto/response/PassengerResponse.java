package com.airline.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerResponse {
    private Long id;
    private String fullName;
    private LocalDate dateOfBirth;
    private String passportNo;
    private String phone;
}
