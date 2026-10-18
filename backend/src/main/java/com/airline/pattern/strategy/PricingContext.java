package com.airline.pattern.strategy;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PricingContext {

    public BigDecimal executeStrategy(PricingStrategy strategy, BigDecimal basePrice,
                                      BigDecimal multiplier, int passengerCount) {
        if (strategy == null) {
            throw new IllegalStateException("Chưa thiết lập chiến lược tính giá (PricingStrategy)");
        }
        return strategy.calculatePrice(basePrice, multiplier, passengerCount);
    }
}
