package com.airline.pattern.state;

import com.airline.domain.enums.BookingStatus;

public interface BookingState {
    BookingStatus getStatus();
    void confirm(BookingStateContext context);
    void cancel(BookingStateContext context);
    void failPayment(BookingStateContext context);
}
