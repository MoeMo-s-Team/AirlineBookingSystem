package com.airline.pattern.factory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record TicketDocument(String type, String pnr, BigDecimal totalPrice,
                             List<Leg> legs, List<String> passengers) {
    public record Leg(String flightNumber, String origin, String destination,
                      LocalDateTime departureTime, LocalDateTime arrivalTime,
                      String fareClass, String seat, String gate,
                      LocalDateTime boardingTime, String qrPayload) {}
}
