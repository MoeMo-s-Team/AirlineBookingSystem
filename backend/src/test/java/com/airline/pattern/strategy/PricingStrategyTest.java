package com.airline.pattern.strategy;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Unit Test cho Strategy Pattern - Tính giá vé theo hạng vé")
class PricingStrategyTest {

    private EconomyPricingStrategy economyStrategy;
    private PremiumPricingStrategy premiumStrategy;
    private BusinessPricingStrategy businessStrategy;
    private PricingStrategyFactory strategyFactory;
    private PricingContext pricingContext;

    @BeforeEach
    void setUp() {
        economyStrategy = new EconomyPricingStrategy();
        premiumStrategy = new PremiumPricingStrategy();
        businessStrategy = new BusinessPricingStrategy();
        strategyFactory = new PricingStrategyFactory(economyStrategy, premiumStrategy, businessStrategy);
        pricingContext = new PricingContext();
    }

    @Test
    @DisplayName("Hạng Economy nhân hệ số 1.0 đúng chuẩn")
    void testEconomyPricingStrategy() {
        BigDecimal basePrice = new BigDecimal("1000000");

        // 1 hành khách
        BigDecimal priceFor1 = economyStrategy.calculatePrice(basePrice, 1);
        assertEquals(new BigDecimal("1000000.00"), priceFor1);

        // 3 hành khách
        BigDecimal priceFor3 = economyStrategy.calculatePrice(basePrice, 3);
        assertEquals(new BigDecimal("3000000.00"), priceFor3);

        assertEquals(new BigDecimal("1.00"), economyStrategy.getMultiplier());
    }

    @Test
    @DisplayName("Hạng Premium Economy nhân hệ số 1.5 đúng chuẩn")
    void testPremiumPricingStrategy() {
        BigDecimal basePrice = new BigDecimal("1000000");

        // 1 hành khách: 1.000.000 * 1.5 = 1.500.000
        BigDecimal priceFor1 = premiumStrategy.calculatePrice(basePrice, 1);
        assertEquals(new BigDecimal("1500000.00"), priceFor1);

        // 2 hành khách: 1.000.000 * 1.5 * 2 = 3.000.000
        BigDecimal priceFor2 = premiumStrategy.calculatePrice(basePrice, 2);
        assertEquals(new BigDecimal("3000000.00"), priceFor2);

        assertEquals(new BigDecimal("1.50"), premiumStrategy.getMultiplier());
    }

    @Test
    @DisplayName("Hạng Business nhân hệ số 2.5 đúng chuẩn")
    void testBusinessPricingStrategy() {
        BigDecimal basePrice = new BigDecimal("2000000");

        // 1 hành khách: 2.000.000 * 2.5 = 5.000.000
        BigDecimal priceFor1 = businessStrategy.calculatePrice(basePrice, 1);
        assertEquals(new BigDecimal("5000000.00"), priceFor1);

        // 4 hành khách: 2.000.000 * 2.5 * 4 = 20.000.000
        BigDecimal priceFor4 = businessStrategy.calculatePrice(basePrice, 4);
        assertEquals(new BigDecimal("20000000.00"), priceFor4);

        assertEquals(new BigDecimal("2.50"), businessStrategy.getMultiplier());
    }

    @Test
    @DisplayName("PricingContext thực thi tính toán đúng theo Strategy được gán")
    void testPricingContext() {
        BigDecimal basePrice = new BigDecimal("1000000");

        pricingContext.setStrategy(economyStrategy);
        assertEquals(new BigDecimal("1000000.00"), pricingContext.executeStrategy(basePrice, 1));

        pricingContext.setStrategy(businessStrategy);
        assertEquals(new BigDecimal("2500000.00"), pricingContext.executeStrategy(basePrice, 1));
    }

    @Test
    @DisplayName("PricingContext báo lỗi IllegalStateException nếu chưa gán Strategy")
    void testPricingContextWithoutStrategy() {
        PricingContext emptyContext = new PricingContext();
        assertThrows(IllegalStateException.class, () ->
                emptyContext.executeStrategy(new BigDecimal("1000000"), 1)
        );
    }

    @Test
    @DisplayName("PricingStrategyFactory trả về đúng Strategy dựa vào mã hạng vé")
    void testPricingStrategyFactory() {
        assertSame(economyStrategy, strategyFactory.getStrategy("ECONOMY"));
        assertSame(premiumStrategy, strategyFactory.getStrategy("PREMIUM"));
        assertSame(businessStrategy, strategyFactory.getStrategy("BUSINESS"));

        // Mã không tồn tại hoặc null mặc định về Economy
        assertSame(economyStrategy, strategyFactory.getStrategy("UNKNOWN"));
        assertSame(economyStrategy, strategyFactory.getStrategy(null));
    }

    @Test
    @DisplayName("Trường hợp ngoại lệ: Giá gốc null hoặc số khách <= 0 trả về 0")
    void testEdgeCases() {
        assertEquals(BigDecimal.ZERO, economyStrategy.calculatePrice(null, 2));
        assertEquals(BigDecimal.ZERO, economyStrategy.calculatePrice(new BigDecimal("1000000"), 0));
        assertEquals(BigDecimal.ZERO, economyStrategy.calculatePrice(new BigDecimal("1000000"), -1));
    }
}
