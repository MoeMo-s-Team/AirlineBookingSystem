package com.airline.pattern.observer;

import com.airline.application.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class InAppNotificationObserver implements BookingObserver {
    private final NotificationService notificationService;

    @Override
    public void onStatusChanged(BookingStatusChangedEvent event) {
        String bookingCode = event.booking().getBookingCode();
        switch (event.currentStatus()) {
            case PENDING -> {
                if (event.previousStatus() == null) {
                    notificationService.createForBooking(event.booking(), "BOOKING_CREATED",
                            "Your booking " + bookingCode + " has been created and is awaiting payment.");
                }
            }
            case CONFIRMED -> notificationService.createForBooking(event.booking(), "BOOKING_CONFIRMED",
                    "Your booking " + bookingCode + " has been confirmed.");
            case CANCELLED -> notificationService.createForBooking(event.booking(), "BOOKING_CANCELLED",
                    "Your booking " + bookingCode + " has been cancelled.");
            case PAYMENT_FAILED -> notificationService.createForBooking(event.booking(), "PAYMENT_FAILED",
                    "Payment for booking " + bookingCode + " failed.");
        }
    }
}
