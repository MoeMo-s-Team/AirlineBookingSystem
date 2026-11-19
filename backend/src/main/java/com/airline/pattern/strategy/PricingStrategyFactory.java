package com.airline.pattern.strategy;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.math.BigDecimal;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PricingStrategyFactory {

    private final Map<String, PricingStrategy> strategies = new ConcurrentHashMap<>();

    public PricingStrategyFactory(
            EconomyPricingStrategy economyStrategy,
            PremiumPricingStrategy premiumStrategy,
            BusinessPricingStrategy businessStrategy,
            FirstClassPricingStrategy firstClassStrategy) {
        strategies.put("ECONOMY", economyStrategy);
        strategies.put("PREMIUM", premiumStrategy);
        strategies.put("BUSINESS", businessStrategy);
        strategies.put("FIRST", firstClassStrategy);
        strategies.put("FIRST_CLASS", firstClassStrategy);
    }

    /**
     * Lấy chiến lược tính giá tương ứng với mã hạng vé.
     * Standard defaults for callers without a database fare; custom codes use 1.0.
     * Booking callers must use the overload accepting the database multiplier.
     */
    public PricingStrategy getStrategy(String fareClassCode) {
        if (fareClassCode == null) {
            return strategies.get("ECONOMY");
        }
        return strategies.getOrDefault(fareClassCode.toUpperCase(java.util.Locale.ROOT).trim(), new CustomPricingStrategy(BigDecimal.ONE));
    }

    public PricingStrategy getStrategy(String fareClassCode, BigDecimal databaseMultiplier) {
        if (databaseMultiplier == null || databaseMultiplier.signum() <= 0)
            throw new IllegalArgumentException("Fare multiplier must be positive");
        if (fareClassCode != null) {
            PricingStrategy known = strategies.get(fareClassCode.toUpperCase(java.util.Locale.ROOT).trim());
            if (known != null) return known;
        }
        return new CustomPricingStrategy(databaseMultiplier);
    }
}
