package com.airline.pattern.observer;

import com.airline.domain.enums.FlightStatus;
import java.time.LocalDateTime;

public record FlightChangedEvent(Long flightId, String flightNumber,
        LocalDateTime oldDeparture, LocalDateTime oldArrival, FlightStatus oldStatus,
        LocalDateTime departure, LocalDateTime arrival, FlightStatus status, boolean seatsChanged) {

    public boolean scheduleChanged() {
        return !oldDeparture.equals(departure) || !oldArrival.equals(arrival) || oldStatus != status;
    }
}
