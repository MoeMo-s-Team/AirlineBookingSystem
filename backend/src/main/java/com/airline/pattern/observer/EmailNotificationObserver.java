package com.airline.pattern.observer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Demo email channel: logs a template after commit; does not send external email. */
@Component
@Slf4j
public class EmailNotificationObserver implements BookingObserver {
    @Override
    public void onStatusChanged(BookingStatusChangedEvent event) {
        if (event.booking().getUser() == null || event.booking().getUser().getEmail() == null) return;
        // Snapshot inside the transaction, without retaining lazy entities for afterCommit.
        String recipient = event.booking().getUser().getEmail();
        String code = event.booking().getBookingCode();
        String status = event.currentStatus().name();
        String itinerary = event.booking().getFlight().getFlightNumber()
                + (event.booking().getReturnFlight() == null ? "" : " / " + event.booking().getReturnFlight().getFlightNumber());
        Runnable email = () -> log.info("[SIMULATED EMAIL] To: {} | Subject: Booking {} - {} | Flights: {} | Your booking status is {}.",
                recipient, code, status, itinerary, status);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { email.run(); }
            });
        } else {
            email.run();
        }
    }
}
