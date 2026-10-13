package com.airline.presentation.controller;

import com.airline.infrastructure.security.ProfilePrincipal;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.ProfileMeResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ProfileControllerTest {

    @Test
    void getMyProfile_shouldReturnProfile_fromAuthenticatedPrincipal() {
        ProfileController controller = new ProfileController();
        UUID userId = UUID.randomUUID();
        ProfilePrincipal principal = ProfilePrincipal.builder()
                .id(userId)
                .email("test@airline.com")
                .fullName("Test User")
                .role("CUSTOMER")
                .build();

        ResponseEntity<ApiResponse<ProfileMeResponse>> response = controller.getMyProfile(principal);

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertTrue(response.getBody().isSuccess());
        ProfileMeResponse data = response.getBody().getData();
        assertNotNull(data);
        assertEquals(userId, data.getId());
        assertEquals("test@airline.com", data.getEmail());
        assertEquals("Test User", data.getFullName());
        assertEquals("CUSTOMER", data.getRole());
    }
}
