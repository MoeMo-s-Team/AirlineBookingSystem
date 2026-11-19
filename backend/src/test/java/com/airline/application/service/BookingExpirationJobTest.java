package com.airline.application.service;

import com.airline.domain.repository.BookingRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageRequest;
import static org.mockito.Mockito.*;

class BookingExpirationJobTest {
    @Test void processesBoundedBatchAndContinuesWhenOneBookingFails() {
        BookingRepository bookings = mock(BookingRepository.class);
        BookingHoldService holds = mock(BookingHoldService.class);
        LocalDateTime now = LocalDateTime.of(2026, 12, 1, 10, 0);
        when(holds.now()).thenReturn(now);
        when(bookings.findExpiredPendingIds(now, PageRequest.of(0, 100))).thenReturn(List.of(1L, 2L));
        doThrow(new IllegalStateException("temporary database failure")).when(holds).expireBooking(1L);
        new BookingExpirationJob(bookings, holds).expirePendingBookings();
        verify(holds).expireBooking(1L);
        verify(holds).expireBooking(2L);
    }
}
