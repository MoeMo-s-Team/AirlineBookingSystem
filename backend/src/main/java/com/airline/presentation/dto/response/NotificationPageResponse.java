package com.airline.presentation.dto.response;

import java.util.List;

public record NotificationPageResponse(
        boolean success,
        List<NotificationResponse> data,
        Pagination pagination
) {
    public record Pagination(long total, int limit, int offset) {
    }
}
