package com.airline.pattern.state;

import com.airline.domain.enums.BookingStatus;

public interface BookingState {

    BookingStatus getStatus();

    default void confirm(BookingStateContext context) {
        reject("confirm");
    }

    default void cancel(BookingStateContext context) {
        reject("cancel");
    }

    default void paymentFailed(BookingStateContext context) {
        reject("mark payment failed");
    }

    private void reject(String action) {
        throw new IllegalStateException(
                "Cannot " + action + " booking in " + getStatus() + " state");
    }
}
