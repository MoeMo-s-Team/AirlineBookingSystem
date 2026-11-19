package com.airline.pattern.observer;

import com.airline.domain.entity.*;
import com.airline.domain.enums.*;
import com.airline.domain.repository.*;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.*;

class FlightNotificationObserverTest {
    @Test void cancellationNotifiesAffectedBookingOwnerAndKeepsPaidBookingStatus() {
        var bookings = mock(BookingRepository.class);
        var notifications = mock(NotificationRepository.class);
        var booking = Booking.builder().status(BookingStatus.CONFIRMED)
                .user(Profile.builder().email("owner@example.com").build()).build();
        when(bookings.findActiveByFlightId(5L)).thenReturn(List.of(booking));
        var departure = LocalDateTime.of(2026, 12, 1, 10, 0);
        new FlightNotificationObserver(bookings, notifications).onFlightChanged(new FlightChangedEvent(5L, "VN5", departure,
                departure.plusHours(2), FlightStatus.SCHEDULED, departure, departure.plusHours(2), FlightStatus.CANCELLED, false));
        verify(notifications).save(argThat(notification -> notification.getBooking() == booking
                && notification.getUser() == booking.getUser() && notification.getType().equals("FLIGHT_CANCELLED")));
        org.assertj.core.api.Assertions.assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test void seatAndScheduleChangesNotifyTheBookingOwner() {
        var bookings = mock(BookingRepository.class);
        var notifications = mock(NotificationRepository.class);
        var booking = Booking.builder().status(BookingStatus.CONFIRMED)
                .user(Profile.builder().email("owner@example.com").build()).build();
        when(bookings.findActiveByFlightId(5L)).thenReturn(List.of(booking));
        var departure = LocalDateTime.of(2026, 12, 1, 10, 0);
        var status = FlightStatus.SCHEDULED;
        var observer = new FlightNotificationObserver(bookings, notifications);
        observer.onFlightChanged(new FlightChangedEvent(5L, "VN5", departure, departure.plusHours(2),
                status, departure, departure.plusHours(2), status, true));
        observer.onFlightChanged(new FlightChangedEvent(5L, "VN5", departure, departure.plusHours(2),
                status, departure.plusHours(1), departure.plusHours(3), FlightStatus.DELAYED, true));

        verify(notifications).save(argThat(notification -> notification.getUser() == booking.getUser()
                && notification.getType().equals("FLIGHT_SEAT_AVAILABILITY_CHANGED")));
        verify(notifications).save(argThat(notification -> notification.getBooking() == booking
                && notification.getType().equals("FLIGHT_SCHEDULE_CHANGED")
                && notification.getMessage().contains("Seat availability was also updated.")));
    }
}
