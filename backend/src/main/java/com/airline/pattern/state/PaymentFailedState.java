package com.airline.pattern.state;

import com.airline.domain.enums.BookingStatus;

public final class PaymentFailedState implements BookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.PAYMENT_FAILED;
    }
}
