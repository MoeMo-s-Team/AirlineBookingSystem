package com.airline.pattern.factory;

import com.airline.application.dto.BookingView;
import com.airline.domain.enums.BookingStatus;
import org.junit.jupiter.api.Test;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class TicketFactoryTest {
    private BookingView booking(BookingStatus status) {
        return new BookingView(1L, "ABC123", status,
                new BookingView.FlightSummary(2L, "VN123", "SGN", "HAN", LocalDateTime.of(2026, 12, 1, 10, 0)),
                new BookingView.FareClassSummary(1L, "ECO", "Economy"),
                List.of(new BookingView.PassengerView(1L, "Nguyễn An", null, null)), List.of(),
                null, BigDecimal.TEN, null, null, null);
    }

    @Test void confirmedTicketContainsItineraryAndPassenger() {
        var ticket = new ETicketFactory().create(booking(BookingStatus.CONFIRMED));
        assertEquals("ABC123", ticket.pnr());
        assertEquals(List.of("Nguyễn An"), ticket.passengers());
        assertEquals("VN123", ticket.legs().get(0).flightNumber());
        assertEquals(BigDecimal.TEN, ticket.totalPrice());
    }

    @Test void pendingBookingsCannotIssueTickets() {
        assertThrows(IllegalArgumentException.class, () -> new ETicketFactory().create(booking(BookingStatus.PENDING)));
        assertThrows(IllegalArgumentException.class, () -> new BoardingPassFactory().create(booking(BookingStatus.CANCELLED)));
    }

    @Test void boardingPreviewDoesNotInventSeatOrGate() {
        var pass = new BoardingPassFactory().create(booking(BookingStatus.CONFIRMED));
        var leg = pass.legs().get(0);
        assertEquals("BOARDING_PASS_PREVIEW", pass.type());
        assertNull(leg.seat());
        assertNull(leg.gate());
        assertEquals(LocalDateTime.of(2026, 12, 1, 9, 30), leg.boardingTime());
        assertTrue(leg.qrPayload().contains("ABC123"));
    }
}
