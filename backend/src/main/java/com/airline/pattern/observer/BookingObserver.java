package com.airline.pattern.observer;

public interface BookingObserver {
    void onStatusChanged(BookingStatusChangedEvent event);
}
