package com.airline.application.dto;

import java.time.LocalDate;
import java.util.List;

public record CreateBookingCommand(
        Long flightId,
        Long fareClassId,
        List<PassengerInput> passengers,
        List<ServiceInput> services,
        Long returnFlightId,
        Long returnFareClassId,
        boolean serviceBundle) {

    public CreateBookingCommand(Long flightId, Long fareClassId, List<PassengerInput> passengers,
                                List<ServiceInput> services, Long returnFlightId, Long returnFareClassId) {
        this(flightId, fareClassId, passengers, services, returnFlightId, returnFareClassId, false);
    }

    public CreateBookingCommand(Long flightId, Long fareClassId, List<PassengerInput> passengers, List<ServiceInput> services) {
        this(flightId, fareClassId, passengers, services, null, null, false);
    }

    public record PassengerInput(String fullName, LocalDate dateOfBirth, String passportNo, String phone) {}

    public record ServiceInput(Long serviceId, Integer quantity) {}
}
