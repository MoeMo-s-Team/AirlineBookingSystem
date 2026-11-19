package com.airline.pattern.decorator;

import java.math.BigDecimal;

/** Adds a persisted service line (unit price multiplied by quantity). */
public record ServicePriceDecorator(BookingPrice wrapped, BigDecimal lineTotal) implements BookingPrice {
    @Override public BigDecimal calculatePrice() { return wrapped.calculatePrice().add(lineTotal); }
}
