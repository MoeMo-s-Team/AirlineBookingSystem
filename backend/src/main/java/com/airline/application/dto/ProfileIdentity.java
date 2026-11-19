package com.airline.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileIdentity {
    private UUID id;
    private String email;
    private String fullName;
    private String role;
    private String phone;
    private java.time.LocalDate dateOfBirth;
    private String passportNo;
}
