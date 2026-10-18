package com.airline.application.service;

import com.airline.domain.entity.Booking;
import com.airline.domain.entity.Notification;
import com.airline.domain.repository.NotificationRepository;
import com.airline.application.dto.NotificationPageView;
import com.airline.application.exception.NotificationNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public NotificationPageView list(UUID userId, Boolean isRead, int limit, int offset) {
        if (limit < 1 || limit > 100) {
            throw new IllegalArgumentException("limit phải từ 1 đến 100");
        }
        if (offset < 0) {
            throw new IllegalArgumentException("offset không được âm");
        }

        List<Notification> notifications = isRead == null
                ? notificationRepository.findForUser(userId, limit, offset)
                : notificationRepository.findForUserByReadStatus(userId, isRead, limit, offset);
        long total = isRead == null
                ? notificationRepository.countByUser_Id(userId)
                : notificationRepository.countByUser_IdAndIsRead(userId, isRead);

        return new NotificationPageView(
                notifications.stream().map(this::toResponse).toList(),
                total, limit, offset);
    }

    @Transactional(readOnly = true)
    public long unreadCount(UUID userId) {
        return notificationRepository.countByUser_IdAndIsRead(userId, false);
    }

    @Transactional
    public void markRead(UUID userId, Long id) {
        Notification notification = notificationRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(NotificationNotFoundException::new);
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public int markAllRead(UUID userId) {
        return notificationRepository.markAllReadForUser(userId);
    }

    /** Called by the in-app observer from the booking status transition. */
    @Transactional
    public void createForBooking(Booking booking, String type, String message) {
        Notification notification = Notification.builder()
                .user(booking.getUser())
                .booking(booking)
                .type(type)
                .message(message)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationPageView.Item toResponse(Notification notification) {
        return new NotificationPageView.Item(
                notification.getId(),
                notification.getType(),
                notification.getMessage(),
                Boolean.TRUE.equals(notification.getIsRead()),
                notification.getBooking() == null ? null : notification.getBooking().getId(),
                notification.getCreatedAt());
    }
}
