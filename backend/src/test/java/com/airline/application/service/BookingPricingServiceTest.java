package com.airline.application.service;

import com.airline.domain.entity.*;
import com.airline.domain.enums.ServiceType;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.*;

class BookingPricingServiceTest {
    final BookingPricingService pricing = new BookingPricingService();
    BookingServiceItem item(ServiceType type, String price, int quantity) {
        return BookingServiceItem.builder().service(AdditionalService.builder().type(type).build())
                .unitPrice(new BigDecimal(price)).quantity(quantity).build();
    }
    List<BookingServiceItem> bundle() {
        return List.of(item(ServiceType.BAGGAGE, "500000", 1), item(ServiceType.MEAL, "200000", 1), item(ServiceType.SEAT, "150000", 1));
    }
    @Test void discountsOnlyServicesAndLeavesTicketsUnchanged() {
        var price = pricing.calculate(new BigDecimal("2000000"), bundle(), true);
        assertThat(price.discount()).isEqualByComparingTo("127500");
        assertThat(price.total()).isEqualByComparingTo("2722500");
    }
    @Test void optionalBundleDoesNotApplyAutomatically() {
        var price = pricing.calculate(new BigDecimal("2000000"), bundle(), false);
        assertThat(price.discount()).isZero();
        assertThat(price.total()).isEqualByComparingTo("2850000");
    }
    @Test void rejectsDiscountWithoutAllRequiredServiceTypes() {
        assertThatThrownBy(() -> pricing.calculate(new BigDecimal("2000000"), List.of(item(ServiceType.BAGGAGE, "500000", 1)), true))
                .isInstanceOf(IllegalArgumentException.class);
    }
    @Test void includesQuantitiesAndRoundsDiscountToTwoDecimals() {
        var price = pricing.calculate(BigDecimal.TEN, List.of(item(ServiceType.BAGGAGE, "1.01", 2),
                item(ServiceType.MEAL, "1.01", 1), item(ServiceType.SEAT, "1.01", 1)), true);
        assertThat(price.discount()).isEqualByComparingTo("0.61");
        assertThat(price.total()).isEqualByComparingTo("13.43");
    }
}
