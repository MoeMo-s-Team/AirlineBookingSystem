package com.airline.pattern.state;

import com.airline.domain.enums.BookingStatus;

public final class PendingState implements BookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.PENDING;
    }

    @Override
    public void confirm(BookingStateContext context) {
        context.transitionTo(BookingStatus.CONFIRMED);
    }

    @Override
    public void cancel(BookingStateContext context) {
        context.transitionTo(BookingStatus.CANCELLED);
    }

    @Override
    public void paymentFailed(BookingStateContext context) {
        context.transitionTo(BookingStatus.PAYMENT_FAILED);
    }
}
