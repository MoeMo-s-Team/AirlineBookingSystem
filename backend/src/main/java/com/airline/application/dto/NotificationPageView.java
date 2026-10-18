package com.airline.application.dto;

import java.time.LocalDateTime;
import java.util.List;

public record NotificationPageView(List<Item> data, long total, int limit, int offset) {
    public record Item(Long id, String type, String message, boolean isRead,
                       Long bookingId, LocalDateTime createdAt) {
    }
}
