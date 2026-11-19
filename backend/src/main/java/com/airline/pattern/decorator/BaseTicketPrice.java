package com.airline.pattern.decorator;

import java.math.BigDecimal;

/** Ticket subtotal already calculated by the fare pricing strategies. */
public record BaseTicketPrice(BigDecimal ticketSubtotal) implements BookingPrice {
    @Override public BigDecimal calculatePrice() { return ticketSubtotal; }
}
