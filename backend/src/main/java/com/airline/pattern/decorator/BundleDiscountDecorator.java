package com.airline.pattern.decorator;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Discount applies only to services, never to the ticket subtotal. */
public record BundleDiscountDecorator(BookingPrice wrapped, BigDecimal servicesSubtotal) implements BookingPrice {
    public BigDecimal discount() {
        return servicesSubtotal.multiply(new BigDecimal("0.15")).setScale(2, RoundingMode.HALF_UP);
    }
    @Override public BigDecimal calculatePrice() { return wrapped.calculatePrice().subtract(discount()); }
}
