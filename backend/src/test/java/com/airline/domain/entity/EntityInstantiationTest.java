package com.airline.domain.entity;

import com.airline.domain.enums.BookingStatus;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class EntityInstantiationTest {
    @Test
    void testFlightAndFareClassCreation() {
        Flight flight = Flight.builder()
            .flightNumber("VN123")
            .origin("SGN")
            .destination("HAN")
            .basePrice(new BigDecimal("1000000"))
            .availableSeats(150)
            .build();
        assertEquals("VN123", flight.getFlightNumber());

        FareClass fareClass = FareClass.builder()
            .code("ECO")
            .name("Economy")
            .priceMultiplier(new BigDecimal("1.0"))
            .build();
        assertEquals("ECO", fareClass.getCode());
        assertEquals(BookingStatus.PENDING, BookingStatus.valueOf("PENDING"));
    }
}
