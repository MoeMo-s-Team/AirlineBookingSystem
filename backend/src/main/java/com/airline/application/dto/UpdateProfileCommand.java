package com.airline.application.dto;

import java.time.LocalDate;

public record UpdateProfileCommand(String fullName, String phone, LocalDate dateOfBirth, String passportNo) {}
