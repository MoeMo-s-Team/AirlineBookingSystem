package com.airline.pattern.strategy;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** A per-request strategy: never cache a database multiplier across fare updates. */
public class CustomPricingStrategy implements PricingStrategy {
    private final BigDecimal multiplier;

    public CustomPricingStrategy(BigDecimal multiplier) {
        if (multiplier == null || multiplier.signum() <= 0)
            throw new IllegalArgumentException("Fare multiplier must be positive");
        this.multiplier = multiplier;
    }

    @Override
    public BigDecimal calculatePrice(BigDecimal basePrice, BigDecimal databaseMultiplier, int passengerCount) {
        if (basePrice == null || passengerCount <= 0) return BigDecimal.ZERO;
        BigDecimal effective = databaseMultiplier == null ? multiplier : databaseMultiplier;
        if (basePrice.signum() < 0 || effective.signum() <= 0)
            throw new IllegalArgumentException("Invalid fare price or multiplier");
        return basePrice.multiply(effective).multiply(BigDecimal.valueOf(passengerCount))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal getMultiplier() { return multiplier; }
}
