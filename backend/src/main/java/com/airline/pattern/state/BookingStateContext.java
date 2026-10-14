package com.airline.pattern.state;

import com.airline.domain.enums.BookingStatus;

public class BookingStateContext {
    private BookingState state;

    public BookingStateContext(BookingStatus initialStatus) {
        if (initialStatus == null) {
            this.state = new PendingState();
        } else {
            this.state = switch (initialStatus) {
                case PENDING -> new PendingState();
                case CONFIRMED -> new ConfirmedState();
                case CANCELLED -> new CancelledState();
                case PAYMENT_FAILED -> new PaymentFailedState();
            };
        }
    }

    public void setState(BookingState state) {
        this.state = state;
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

    public void failPayment() {
        state.failPayment(this);
    }
}
