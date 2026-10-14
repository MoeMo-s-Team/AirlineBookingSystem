package com.airline.pattern.state;

import com.airline.application.exception.BookingConflictException;
import com.airline.domain.enums.BookingStatus;

public class ConfirmedState implements BookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.CONFIRMED;
    }

    @Override
    public void confirm(BookingStateContext context) {
        throw new BookingConflictException("Cannot confirm booking that is already confirmed");
    }

    @Override
    public void cancel(BookingStateContext context) {
        throw new BookingConflictException("Cannot cancel booking that is already confirmed");
    }

    @Override
    public void failPayment(BookingStateContext context) {
        throw new BookingConflictException("Cannot fail payment for booking that is already confirmed");
    }
}
