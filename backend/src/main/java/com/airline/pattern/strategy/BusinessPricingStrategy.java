package com.airline.pattern.strategy;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component("BUSINESS_STRATEGY")
public class BusinessPricingStrategy implements PricingStrategy {

    public static final BigDecimal MULTIPLIER = new BigDecimal("2.50");

    @Override
    public BigDecimal calculatePrice(BigDecimal basePrice, int passengerCount) {
        if (basePrice == null || passengerCount <= 0) {
            return BigDecimal.ZERO;
        }
        return basePrice.multiply(MULTIPLIER)
                .multiply(BigDecimal.valueOf(passengerCount))
                .setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    public BigDecimal getMultiplier() {
        return MULTIPLIER;
    }
}
