package com.airline.pattern.factory;

import com.airline.application.dto.BookingView;

public interface TicketFactory {
    TicketDocument create(BookingView booking);
}
