package com.airline.pattern.observer;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

class BookingSubjectTest {
    @Test
    void publishesOnlyRealStatusTransitions() {
        BookingObserver observer = mock(BookingObserver.class);
        BookingSubject subject = new BookingSubject(List.of(observer));
        Booking booking = Booking.builder().status(BookingStatus.PENDING).build();

        subject.publishStatusChanged(booking, BookingStatus.PENDING);
        verifyNoInteractions(observer);

        booking.setStatus(BookingStatus.CONFIRMED);
        subject.publishStatusChanged(booking, BookingStatus.PENDING);
        verify(observer).onStatusChanged(argThat(event ->
                event.booking() == booking
                        && event.previousStatus() == BookingStatus.PENDING
                        && event.currentStatus() == BookingStatus.CONFIRMED));
        assertEquals(BookingStatus.CONFIRMED, booking.getStatus());
    }
}
