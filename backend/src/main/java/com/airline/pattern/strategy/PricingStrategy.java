package com.airline.pattern.strategy;

import java.math.BigDecimal;

public interface PricingStrategy {

    /**
     * Tính giá vé theo hạng vé và số lượng hành khách
     * Công thức: basePrice × multiplier × passengerCount
     *
     * @param basePrice Giá vé cơ bản của chuyến bay
     * @param passengerCount Số lượng hành khách
     * @return Tổng giá vé cho các hành khách theo hạng vé này
     */
    BigDecimal calculatePrice(BigDecimal basePrice, int passengerCount);

    /**
     * Lấy hệ số nhân giá của hạng vé này
     */
    BigDecimal getMultiplier();
}
