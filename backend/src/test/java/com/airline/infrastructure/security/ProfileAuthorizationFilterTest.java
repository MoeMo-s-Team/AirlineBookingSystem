package com.airline.infrastructure.security;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.ProfileAuthorizationException;
import com.airline.application.service.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileAuthorizationFilterTest {

    @Mock
    private ProfileService profileService;

    @Mock
    private FilterChain filterChain;

    private ProfileAuthorizationFilter filter;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        filter = new ProfileAuthorizationFilter(profileService, objectMapper);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private JwtAuthenticationToken createJwtToken(String sub) {
        Jwt jwt = new Jwt(
                "token-value",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "RS256"),
                Map.of("sub", sub)
        );
        return new JwtAuthenticationToken(jwt);
    }

    @Test
    void doFilter_shouldInstallProfileIdentity_whenProfileFound() throws Exception {
        UUID userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(createJwtToken(userId.toString()));

        ProfileIdentity identity = ProfileIdentity.builder()
                .id(userId)
                .email("user@example.com")
                .fullName("John Doe")
                .role("CUSTOMER")
                .build();

        when(profileService.requireIdentity(userId)).thenReturn(identity);

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/profile/me");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertInstanceOf(ProfileIdentity.class, auth.getPrincipal());
        ProfileIdentity principal = (ProfileIdentity) auth.getPrincipal();
        assertEquals(userId, principal.getId());
        assertEquals("CUSTOMER", principal.getRole());
        assertTrue(auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")));
    }

    @Test
    void doFilter_shouldReturn403ProfileNotFound_whenProfileMissing() throws Exception {
        UUID userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(createJwtToken(userId.toString()));

        when(profileService.requireIdentity(userId))
                .thenThrow(new ProfileAuthorizationException("PROFILE_NOT_FOUND", "Profile not found"));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/profile/me");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        assertEquals(403, response.getStatus());
        assertTrue(response.getContentAsString().contains("PROFILE_NOT_FOUND"));
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_shouldReturn403ProfileRoleInvalid_whenRoleInvalid() throws Exception {
        UUID userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(createJwtToken(userId.toString()));

        when(profileService.requireIdentity(userId))
                .thenThrow(new ProfileAuthorizationException("PROFILE_ROLE_INVALID", "Invalid role"));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/profile/me");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        assertEquals(403, response.getStatus());
        assertTrue(response.getContentAsString().contains("PROFILE_ROLE_INVALID"));
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void doFilter_shouldReturn500ProfileLookupFailed_whenDatabaseException() throws Exception {
        UUID userId = UUID.randomUUID();
        SecurityContextHolder.getContext().setAuthentication(createJwtToken(userId.toString()));

        when(profileService.requireIdentity(userId))
                .thenThrow(new DataAccessResourceFailureException("DB connection refused"));

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/profile/me");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        verify(filterChain, never()).doFilter(request, response);
        assertEquals(500, response.getStatus());
        assertTrue(response.getContentAsString().contains("PROFILE_LOOKUP_FAILED"));
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }

    @Test
    void shouldNotFilter_shouldBypassPublicGetRoutes() {
        MockHttpServletRequest req1 = new MockHttpServletRequest("GET", "/api/flights");
        assertTrue(filter.shouldNotFilter(req1));

        MockHttpServletRequest req2 = new MockHttpServletRequest("GET", "/api/fares/1");
        assertTrue(filter.shouldNotFilter(req2));

        MockHttpServletRequest req3 = new MockHttpServletRequest("GET", "/api/services");
        assertTrue(filter.shouldNotFilter(req3));

        MockHttpServletRequest req4 = new MockHttpServletRequest("GET", "/api-docs");
        assertTrue(filter.shouldNotFilter(req4));
    }

    @Test
    void shouldNotFilter_shouldNotBypassAdminAllRoutesOrMutations() {
        MockHttpServletRequest req1 = new MockHttpServletRequest("GET", "/api/fares/all");
        assertFalse(filter.shouldNotFilter(req1));

        MockHttpServletRequest req2 = new MockHttpServletRequest("GET", "/api/services/all");
        assertFalse(filter.shouldNotFilter(req2));

        MockHttpServletRequest req3 = new MockHttpServletRequest("POST", "/api/fares");
        assertFalse(filter.shouldNotFilter(req3));

        MockHttpServletRequest req4 = new MockHttpServletRequest("GET", "/api/profile/me");
        assertFalse(filter.shouldNotFilter(req4));
    }
}
