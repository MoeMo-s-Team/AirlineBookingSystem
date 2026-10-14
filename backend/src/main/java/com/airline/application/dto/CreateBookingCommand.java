package com.airline.application.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateBookingCommand(
        Long flightId,
        Long fareClassId,
        List<PassengerInput> passengers,
        List<ServiceInput> services) {

    public record PassengerInput(String fullName, LocalDate dateOfBirth, String passportNo, String phone) {}

    public record ServiceInput(Long serviceId, Integer quantity) {}
}
