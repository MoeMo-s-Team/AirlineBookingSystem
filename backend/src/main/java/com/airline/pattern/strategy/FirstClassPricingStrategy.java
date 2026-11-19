package com.airline.pattern.strategy;

import java.math.BigDecimal;
import org.springframework.stereotype.Component;

@Component("FIRST_CLASS_STRATEGY")
public class FirstClassPricingStrategy extends CustomPricingStrategy {
    public static final BigDecimal MULTIPLIER = new BigDecimal("3.50");
    public FirstClassPricingStrategy() { super(MULTIPLIER); }
}
