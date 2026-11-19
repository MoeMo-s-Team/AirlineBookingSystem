package com.airline.pattern.observer;

import com.airline.domain.entity.Notification;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.NotificationRepository;
import com.airline.domain.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminNotificationObserver implements BookingObserver {
    private final ProfileRepository profileRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void onStatusChanged(BookingStatusChangedEvent event) {
        if (event.previousStatus() != null || event.currentStatus() != BookingStatus.PENDING) return;
        profileRepository.findByRole_Name("ADMIN").forEach(admin -> notificationRepository.save(
                Notification.builder().user(admin).booking(event.booking()).type("ADMIN_BOOKING_CREATED")
                        .message("New booking " + event.booking().getBookingCode() + " is awaiting payment.")
                        .isRead(false).build()));
    }
}
