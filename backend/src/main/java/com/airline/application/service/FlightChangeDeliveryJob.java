package com.airline.application.service;

import com.airline.domain.repository.FlightChangeDeliveryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component @RequiredArgsConstructor @Slf4j
public class FlightChangeDeliveryJob {
    private final FlightChangeDeliveryRepository deliveries;
    private final FlightChangeDeliveryService service;
    @Scheduled(fixedDelayString = "${flight.notifications.interval-ms:5000}",
            initialDelayString = "${flight.notifications.interval-ms:5000}")
    public void deliverPending() {
        for (Long id : deliveries.findPendingIds(PageRequest.of(0, 100))) {
            try { service.deliver(id); }
            catch (RuntimeException error) { log.error("Flight notification delivery {} will be retried", id, error); }
        }
    }
}
