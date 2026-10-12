package com.airline.pattern.observer;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BookingSubject {
    private final List<BookingObserver> observers;

    /** Call after persisting a booking status change, inside the booking transaction. */
    public void publishStatusChanged(Booking booking, BookingStatus previousStatus) {
        BookingStatus currentStatus = booking.getStatus();
        if (currentStatus == null || currentStatus == previousStatus) {
            return;
        }
        BookingStatusChangedEvent event = new BookingStatusChangedEvent(booking, previousStatus, currentStatus);
        observers.forEach(observer -> observer.onStatusChanged(event));
    }
}
