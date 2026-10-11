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
    }

    @Test
    void successWithPaginationIncludesPagination() {
        ApiResponse<String> response = ApiResponse.successWithPagination("Hello",
                ApiResponse.Pagination.builder().total(1).page(0).size(20).totalPages(1).build());

        assertTrue(response.isSuccess());
        assertEquals(1, response.getPagination().getTotal());
    }
}
