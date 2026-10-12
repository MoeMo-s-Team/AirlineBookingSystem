package com.airline.pattern.strategy;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class PricingStrategyFactory {

    private final Map<String, PricingStrategy> strategies = new ConcurrentHashMap<>();

    public PricingStrategyFactory(
            EconomyPricingStrategy economyStrategy,
            PremiumPricingStrategy premiumStrategy,
            BusinessPricingStrategy businessStrategy) {
        strategies.put("ECONOMY", economyStrategy);
        strategies.put("PREMIUM", premiumStrategy);
        strategies.put("BUSINESS", businessStrategy);
    }

    /**
     * Lấy chiến lược tính giá tương ứng với mã hạng vé.
     * Mặc định trả về EconomyStrategy nếu không khớp hoặc null.
     */
    public PricingStrategy getStrategy(String fareClassCode) {
        if (fareClassCode == null) {
            return strategies.get("ECONOMY");
        }
        return strategies.getOrDefault(fareClassCode.toUpperCase().trim(), strategies.get("ECONOMY"));
    }
}
