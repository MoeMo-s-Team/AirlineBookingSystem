package com.airline.pattern.observer;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;

public record BookingStatusChangedEvent(
        Booking booking,
        BookingStatus previousStatus,
        BookingStatus currentStatus
) {
}
