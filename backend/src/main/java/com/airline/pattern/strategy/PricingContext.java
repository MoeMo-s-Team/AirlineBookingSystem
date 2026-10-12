package com.airline.pattern.strategy;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@NoArgsConstructor
@AllArgsConstructor
@Setter
public class PricingContext {

    private PricingStrategy strategy;

    public BigDecimal executeStrategy(BigDecimal basePrice, int passengerCount) {
        if (strategy == null) {
            throw new IllegalStateException("Chưa thiết lập chiến lược tính giá (PricingStrategy)");
        }
        return strategy.calculatePrice(basePrice, passengerCount);
    }
}
