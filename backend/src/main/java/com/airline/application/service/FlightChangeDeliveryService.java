package com.airline.application.service;

import com.airline.domain.repository.FlightChangeDeliveryRepository;
import com.airline.pattern.observer.FlightObserver;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FlightChangeDeliveryService {
    private final FlightChangeDeliveryRepository deliveries;
    private final List<FlightObserver> observers;

    @Transactional
    public void deliver(Long id) {
        deliveries.findForUpdate(id).filter(delivery -> !delivery.isProcessed()).ifPresent(delivery -> {
            var event = new com.airline.pattern.observer.FlightChangedEvent(delivery.getFlightId(), delivery.getFlightNumber(),
                    delivery.getOldDeparture(), delivery.getOldArrival(), delivery.getOldStatus(),
                    delivery.getDeparture(), delivery.getArrival(), delivery.getStatus(), delivery.isSeatsChanged());
            observers.forEach(observer -> observer.onFlightChanged(event));
            delivery.setProcessed(true);
            deliveries.save(delivery);
        });
    }
}
