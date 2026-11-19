package com.airline.pattern.observer;

import com.airline.domain.entity.Notification;
import com.airline.domain.enums.FlightStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@RequiredArgsConstructor
@Slf4j
public class FlightNotificationObserver implements FlightObserver {
    private final BookingRepository bookings;
    private final NotificationRepository notifications;

    @Override public void onFlightChanged(FlightChangedEvent event) {
        String type;
        String message;
        if (event.status() == FlightStatus.CANCELLED) {
            type = "FLIGHT_CANCELLED";
            message = "Flight " + event.flightNumber() + " was cancelled. Please contact support for rebooking or refund assistance.";
        } else if (event.scheduleChanged()) {
            type = "FLIGHT_SCHEDULE_CHANGED";
            message = "Flight " + event.flightNumber() + " schedule changed: " + event.oldDeparture() + " → " + event.departure()
                    + "; arrival " + event.oldArrival() + " → " + event.arrival() + "."
                    + (event.seatsChanged() ? " Seat availability was also updated." : "");
        } else {
            type = "FLIGHT_SEAT_AVAILABILITY_CHANGED";
            message = "Seat availability for flight " + event.flightNumber() + " was updated.";
        }
        bookings.findActiveByFlightId(event.flightId()).forEach(booking -> {
            notifications.save(Notification.builder().booking(booking).user(booking.getUser())
                    .type(type).message(message).isRead(false).build());
            String email = booking.getUser().getEmail();
            Runnable notify = () -> log.info("[SIMULATED EMAIL] To: {} | {}", email, message);
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override public void afterCommit() { notify.run(); }
                });
            } else notify.run();
        });
    }
}
