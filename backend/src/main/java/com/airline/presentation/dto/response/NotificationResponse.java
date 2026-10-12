package com.airline.presentation.dto.response;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        String message,
        boolean isRead,
        Long bookingId,
        LocalDateTime createdAt
) {
}
