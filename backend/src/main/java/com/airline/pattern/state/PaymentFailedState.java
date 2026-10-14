package com.airline.pattern.state;

import com.airline.application.exception.BookingConflictException;
import com.airline.domain.enums.BookingStatus;

public class PaymentFailedState implements BookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.PAYMENT_FAILED;
    }

    @Override
    public void confirm(BookingStateContext context) {
        throw new BookingConflictException("Cannot confirm booking whose payment failed");
    }

    @Override
    public void cancel(BookingStateContext context) {
        throw new BookingConflictException("Cannot cancel booking whose payment failed");
    }

    @Override
    public void failPayment(BookingStateContext context) {
        throw new BookingConflictException("Cannot fail payment for booking whose payment already failed");
    }
}
