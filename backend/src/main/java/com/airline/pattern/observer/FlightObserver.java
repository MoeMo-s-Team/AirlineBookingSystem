package com.airline.pattern.observer;

public interface FlightObserver {
    void onFlightChanged(FlightChangedEvent event);
}
