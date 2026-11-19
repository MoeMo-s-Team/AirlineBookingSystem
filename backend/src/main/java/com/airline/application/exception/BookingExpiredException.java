package com.airline.application.exception;

public class BookingExpiredException extends BookingConflictException {
    public BookingExpiredException() {
        super("Booking can no longer be paid. Its hold expired or a flight is unavailable.");
    }
}
