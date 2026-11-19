package com.airline.pattern.observer;

import com.airline.domain.entity.*;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.*;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(OutputCaptureExtension.class)
class AdditionalObserversTest {
    Booking booking() {
        return Booking.builder().id(1L).bookingCode("BKTEST01")
                .user(Profile.builder().email("test@example.com").build())
                .flight(Flight.builder().flightNumber("OUT1").build())
                .returnFlight(Flight.builder().flightNumber("RET1").build()).build();
    }

    @AfterEach void clearSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) TransactionSynchronizationManager.clearSynchronization();
    }

    @Test void adminNotificationsAreCreatedForAdminsOnlyOnInitialCreation() {
        ProfileRepository profiles = mock(ProfileRepository.class);
        NotificationRepository notifications = mock(NotificationRepository.class);
        Profile admin = Profile.builder().id(UUID.randomUUID()).build();
        when(profiles.findByRole_Name("ADMIN")).thenReturn(List.of(admin));
        var observer = new AdminNotificationObserver(profiles, notifications);
        Booking booking = booking();
        observer.onStatusChanged(new BookingStatusChangedEvent(booking, null, BookingStatus.PENDING));
        verify(notifications).save(org.mockito.ArgumentMatchers.argThat(notification ->
                notification.getUser() == admin && notification.getBooking() == booking
                        && notification.getType().equals("ADMIN_BOOKING_CREATED")));
        observer.onStatusChanged(new BookingStatusChangedEvent(booking, BookingStatus.PENDING, BookingStatus.CONFIRMED));
        verify(profiles, times(1)).findByRole_Name("ADMIN");
        verifyNoMoreInteractions(notifications);
    }

    @Test void emailIsLoggedOnlyAfterCommit(CapturedOutput output) {
        TransactionSynchronizationManager.initSynchronization();
        new EmailNotificationObserver().onStatusChanged(new BookingStatusChangedEvent(booking(), BookingStatus.PENDING, BookingStatus.CONFIRMED));
        assertThat(output.getOut()).doesNotContain("[SIMULATED EMAIL]");
        TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCommit());
        assertThat(output.getOut()).contains("[SIMULATED EMAIL]", "test@example.com", "CONFIRMED", "OUT1 / RET1");
    }

    @Test void rolledBackBookingDoesNotLogEmail(CapturedOutput output) {
        TransactionSynchronizationManager.initSynchronization();
        new EmailNotificationObserver().onStatusChanged(new BookingStatusChangedEvent(booking(), null, BookingStatus.PENDING));
        TransactionSynchronizationManager.getSynchronizations().forEach(sync -> sync.afterCompletion(1));
        assertThat(output.getOut()).doesNotContain("[SIMULATED EMAIL]");
    }
}
