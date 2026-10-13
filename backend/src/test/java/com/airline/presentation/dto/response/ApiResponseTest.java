package com.airline.presentation.dto.response;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {
    @Test
    void testSuccessResponse() {
        ApiResponse<String> response = ApiResponse.success("Hello");
        assertTrue(response.isSuccess());
        assertEquals("Hello", response.getData());
    }

    @Test
    void testErrorResponse() {
        ApiResponse<Void> response = ApiResponse.error("Something went wrong");
        assertFalse(response.isSuccess());
        assertEquals("Something went wrong", response.getMessage());
        assertNull(response.getCode());
    }

    @Test
    void testErrorResponseWithCode() {
        ApiResponse<Void> response = ApiResponse.error("UNAUTHORIZED", "Missing token");
        assertFalse(response.isSuccess());
        assertEquals("UNAUTHORIZED", response.getCode());
        assertEquals("Missing token", response.getMessage());
    }
}
