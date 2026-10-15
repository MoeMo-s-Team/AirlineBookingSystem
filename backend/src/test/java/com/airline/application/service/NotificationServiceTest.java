package com.airline.application.service;

import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Notification;
import com.airline.domain.entity.Profile;
import com.airline.domain.repository.NotificationRepository;
import com.airline.application.dto.NotificationPageView;
import com.airline.application.exception.NotificationNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class NotificationServiceTest {
    private NotificationRepository repository;
    private NotificationService service;
    private final UUID owner = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        repository = mock(NotificationRepository.class);
        service = new NotificationService(repository);
    }

    @Test
    void listsOnlyCurrentUsersUnreadNotificationsWithExactOffset() {
        Booking booking = Booking.builder().id(7L).build();
        Notification notification = Notification.builder()
                .id(3L).booking(booking).type("BOOKING_CONFIRMED")
                .message("Confirmed").isRead(false)
                .createdAt(LocalDateTime.of(2026, 10, 12, 10, 0)).build();
        when(repository.findForUserByReadStatus(owner, false, 20, 5)).thenReturn(List.of(notification));
        when(repository.countByUser_IdAndIsRead(owner, false)).thenReturn(6L);

        NotificationPageView result = service.list(owner, false, 20, 5);

        assertEquals(6, result.total());
        assertEquals(5, result.offset());
        assertEquals(7L, result.data().get(0).bookingId());
        assertFalse(result.data().get(0).isRead());
        verify(repository).findForUserByReadStatus(owner, false, 20, 5);
        verify(repository, never()).findForUser(any(), anyInt(), anyInt());
    }

    @Test
    void refusesMarkReadForAnotherUsersNotification() {
        when(repository.findByIdAndUser_Id(9L, owner)).thenReturn(Optional.empty());

        assertThrows(NotificationNotFoundException.class, () -> service.markRead(owner, 9L));

        verify(repository).findByIdAndUser_Id(9L, owner);
        verify(repository, never()).save(any());
    }

    @Test
    void marksOwnNotificationRead() {
        Notification notification = Notification.builder().id(9L).isRead(false).build();
        when(repository.findByIdAndUser_Id(9L, owner)).thenReturn(Optional.of(notification));

        service.markRead(owner, 9L);
        assertTrue(notification.getIsRead());
        verify(repository).save(notification);
    }

    @Test
    void marksAllUnreadNotificationsForCurrentUserOnly() {
        when(repository.markAllReadForUser(owner)).thenReturn(3);

        assertEquals(3, service.markAllRead(owner));
        verify(repository).markAllReadForUser(owner);
        verifyNoMoreInteractions(repository);
    }

    @Test
    void rejectsUnboundedPagination() {
        assertThrows(IllegalArgumentException.class, () -> service.list(owner, null, 101, 0));
        assertThrows(IllegalArgumentException.class, () -> service.list(owner, null, 20, -1));
        verifyNoInteractions(repository);
    }

    @Test
    void createsUnreadNotificationForBookingOwner() {
        Profile profile = Profile.builder().id(owner).build();
        Booking booking = Booking.builder().id(7L).user(profile).bookingCode("BK-123").build();

        service.createForBooking(booking, "BOOKING_CONFIRMED", "Confirmed");

        verify(repository).save(argThat(notification ->
                notification.getUser() == profile && notification.getBooking() == booking
                        && !notification.getIsRead() && notification.getType().equals("BOOKING_CONFIRMED")));
    }
}
