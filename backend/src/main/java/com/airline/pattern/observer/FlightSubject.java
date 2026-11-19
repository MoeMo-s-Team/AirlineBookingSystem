package com.airline.pattern.observer;

import com.airline.domain.entity.FlightChangeDelivery;
import com.airline.domain.repository.FlightChangeDeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FlightSubject {
    private final FlightChangeDeliveryRepository deliveries;
    public void publish(FlightChangedEvent event) {
        if (!event.scheduleChanged() && !event.seatsChanged()) return;
        // Persist with the flight update. A worker dispatches after commit, without holding flight locks.
        FlightChangeDelivery delivery = new FlightChangeDelivery();
        delivery.setFlightId(event.flightId()); delivery.setFlightNumber(event.flightNumber());
        delivery.setOldDeparture(event.oldDeparture()); delivery.setOldArrival(event.oldArrival());
        delivery.setDeparture(event.departure()); delivery.setArrival(event.arrival());
        delivery.setOldStatus(event.oldStatus()); delivery.setStatus(event.status());
        delivery.setSeatsChanged(event.seatsChanged());
        deliveries.save(delivery);
    }
}
