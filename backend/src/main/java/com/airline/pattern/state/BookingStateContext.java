package com.airline.pattern.state;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;

import java.util.Objects;

public final class BookingStateContext {

    private final Booking booking;
    private BookingState state;

    public BookingStateContext(Booking booking) {
        this.booking = Objects.requireNonNull(booking, "booking must not be null");
        this.state = stateFor(Objects.requireNonNull(booking.getStatus(), "booking status must not be null"));
    }

    public Booking getBooking() {
        return booking;
    }

    public BookingStatus getStatus() {
        return state.getStatus();
    }

    public void confirm() {
        state.confirm(this);
    }

    public void cancel() {
        state.cancel(this);
    }

    public void paymentFailed() {
        state.paymentFailed(this);
    }

    void transitionTo(BookingStatus status) {
        state = stateFor(status);
        booking.setStatus(status);
    }

    private BookingState stateFor(BookingStatus status) {
        return switch (status) {
            case PENDING -> new PendingState();
            case CONFIRMED -> new ConfirmedState();
            case CANCELLED -> new CancelledState();
            case PAYMENT_FAILED -> new PaymentFailedState();
        };
    }
}
