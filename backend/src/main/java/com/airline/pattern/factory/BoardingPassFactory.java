package com.airline.pattern.factory;

import com.airline.application.dto.BookingView;
import org.springframework.stereotype.Component;

/** Preview only: seat and gate must come from a future check-in integration. */
@Component
public class BoardingPassFactory implements TicketFactory {
    @Override
    public TicketDocument create(BookingView booking) {
        var ticket = new ETicketFactory().create(booking);
        var legs = new java.util.ArrayList<TicketDocument.Leg>();
        legs.add(leg(booking, booking.flight(), booking.fareClass()));
        if (booking.returnFlight() != null)
            legs.add(leg(booking, booking.returnFlight(), booking.returnFareClass()));
        return new TicketDocument("BOARDING_PASS_PREVIEW", ticket.pnr(), ticket.totalPrice(),
                legs, ticket.passengers());
    }

    private TicketDocument.Leg leg(BookingView booking, BookingView.FlightSummary flight,
                                       BookingView.FareClassSummary fare) {
        return new TicketDocument.Leg(flight.flightNumber(), flight.origin(), flight.destination(),
                flight.departureTime(), flight.arrivalTime(), fare.name(), null, null,
                flight.departureTime().minusMinutes(30),
                "SKYWING:PREVIEW:" + booking.bookingCode() + ":" + flight.id());
    }
}
