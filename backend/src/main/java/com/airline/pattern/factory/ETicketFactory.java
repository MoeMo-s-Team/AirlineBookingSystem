package com.airline.pattern.factory;

import com.airline.application.dto.BookingView;
import com.airline.domain.enums.BookingStatus;
import org.springframework.stereotype.Component;
import java.util.ArrayList;

@Component
public class ETicketFactory implements TicketFactory {
    @Override
    public TicketDocument create(BookingView booking) {
        if (booking.status() != BookingStatus.CONFIRMED)
            throw new IllegalArgumentException("Tickets require a confirmed booking");
        var legs = new ArrayList<TicketDocument.Leg>();
        legs.add(leg(booking, booking.flight(), booking.fareClass()));
        if (booking.returnFlight() != null)
            legs.add(leg(booking, booking.returnFlight(), booking.returnFareClass()));
        return new TicketDocument("E_TICKET", booking.bookingCode(), booking.totalPrice(), legs,
                booking.passengers().stream().map(BookingView.PassengerView::fullName).toList());
    }

    protected TicketDocument.Leg leg(BookingView booking, BookingView.FlightSummary flight,
                                       BookingView.FareClassSummary fare) {
        return new TicketDocument.Leg(flight.flightNumber(), flight.origin(), flight.destination(),
                flight.departureTime(), flight.arrivalTime(), fare.name(), null, null, null, null);
    }
}
