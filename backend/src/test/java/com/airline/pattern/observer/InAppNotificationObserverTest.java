package com.airline.pattern.observer;

import com.airline.application.service.NotificationService;
import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;
import org.junit.jupiter.api.Test;

import static org.mockito.Mockito.*;

class InAppNotificationObserverTest {
    @Test
    void newBookingNotificationRemindsCustomerToPay() {
        NotificationService service = mock(NotificationService.class);
        InAppNotificationObserver observer = new InAppNotificationObserver(service);
        Booking booking = Booking.builder().bookingCode("BK-123").build();

        observer.onStatusChanged(new BookingStatusChangedEvent(
                booking, null, BookingStatus.PENDING));

        verify(service).createForBooking(booking, "BOOKING_CREATED",
                "Your booking BK-123 has been created and is awaiting payment.");
    }

    @Test
    void createsInAppNotificationForConfirmedBooking() {
        NotificationService service = mock(NotificationService.class);
        InAppNotificationObserver observer = new InAppNotificationObserver(service);
        Booking booking = Booking.builder().bookingCode("BK-123").build();

        observer.onStatusChanged(new BookingStatusChangedEvent(
                booking, BookingStatus.PENDING, BookingStatus.CONFIRMED));

        verify(service).createForBooking(booking, "BOOKING_CONFIRMED",
                "Your booking BK-123 has been confirmed.");
    }

    @Test
    void doesNotTreatReturnToPendingAsNewBooking() {
        NotificationService service = mock(NotificationService.class);
        InAppNotificationObserver observer = new InAppNotificationObserver(service);
        Booking booking = Booking.builder().bookingCode("BK-123").build();

        observer.onStatusChanged(new BookingStatusChangedEvent(
                booking, BookingStatus.PAYMENT_FAILED, BookingStatus.PENDING));

        verifyNoInteractions(service);
    }
}
