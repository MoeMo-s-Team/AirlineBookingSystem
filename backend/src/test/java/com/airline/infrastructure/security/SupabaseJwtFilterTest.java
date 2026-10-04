package com.airline.infrastructure.security;

import com.airline.config.SupabaseProperties;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SupabaseJwtFilterTest {

    private SupabaseProperties supabaseProperties;
    private SupabaseJwtFilter filter;
    private static final String SECRET = "0123456789012345678901234567890123456789";

    @BeforeEach
    void setUp() {
        supabaseProperties = new SupabaseProperties();
        supabaseProperties.setSecretKey(SECRET);
        filter = new SupabaseJwtFilter(supabaseProperties);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void testFilterHandlesTokenWithoutRoleClaim() throws ServletException, IOException {
        SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
        String token = Jwts.builder()
            .subject("user-uuid-123")
            .signWith(key)
            .compact();

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = mock(FilterChain.class);

        filter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth, "Authentication should not be null");
        assertEquals("user-uuid-123", auth.getPrincipal());
        assertFalse(
            auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_null")),
            "Authority should not be ROLE_null"
        );
        assertTrue(
            auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER")),
            "Authority should default to ROLE_CUSTOMER"
        );
    }
}
