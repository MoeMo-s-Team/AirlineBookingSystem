package com.airline.application.service;

import com.airline.domain.entity.BookingServiceItem;
import com.airline.domain.enums.ServiceType;
import com.airline.pattern.decorator.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class BookingPricingService {
    public record Price(BigDecimal total, BigDecimal discount) {}

    public Price calculate(BigDecimal tickets, List<BookingServiceItem> items, boolean bundle) {
        BookingPrice price = new BaseTicketPrice(tickets);
        BigDecimal services = BigDecimal.ZERO;
        for (BookingServiceItem item : items) {
            BigDecimal line = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            services = services.add(line);
            price = new ServicePriceDecorator(price, line);
        }
        BigDecimal discount = BigDecimal.ZERO;
        if (bundle) {
            Set<ServiceType> types = items.stream().map(item -> item.getService().getType()).collect(Collectors.toSet());
            if (!types.containsAll(Set.of(ServiceType.BAGGAGE, ServiceType.MEAL, ServiceType.SEAT))) {
                throw new IllegalArgumentException("Bundle requires baggage, meal and seat services.");
            }
            BundleDiscountDecorator discounted = new BundleDiscountDecorator(price, services);
            discount = discounted.discount();
            price = discounted;
        }
        return new Price(price.calculatePrice().setScale(2, RoundingMode.HALF_UP), discount);
    }
}
