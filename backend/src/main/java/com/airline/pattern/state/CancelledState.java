package com.airline.pattern.state;

import com.airline.domain.enums.BookingStatus;

public final class CancelledState implements BookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.CANCELLED;
    }
}
