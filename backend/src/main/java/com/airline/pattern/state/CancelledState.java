package com.airline.pattern.state;

import com.airline.application.exception.BookingConflictException;
import com.airline.domain.enums.BookingStatus;

public class CancelledState implements BookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.CANCELLED;
    }

    @Override
    public void confirm(BookingStateContext context) {
        throw new BookingConflictException("Cannot confirm booking that is cancelled");
    }

    @Override
    public void cancel(BookingStateContext context) {
        throw new BookingConflictException("Cannot cancel booking that is already cancelled");
    }

    @Override
    public void failPayment(BookingStateContext context) {
        throw new BookingConflictException("Cannot fail payment for booking that is cancelled");
    }
}
