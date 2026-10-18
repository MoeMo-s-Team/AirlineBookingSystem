package com.airline.pattern.state;

import com.airline.domain.enums.BookingStatus;

public class PendingState implements BookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.PENDING;
    }

    @Override
    public void confirm(BookingStateContext context) {
        context.setState(new ConfirmedState());
    }

    @Override
    public void cancel(BookingStateContext context) {
        context.setState(new CancelledState());
    }

    @Override
    public void failPayment(BookingStateContext context) {
        context.setState(new PaymentFailedState());
    }
}
