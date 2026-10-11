package com.airline.infrastructure.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;

import java.time.Instant;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SupabaseJwtFilterTest {

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void usesDecodedSupabaseJwtAndDefaultsAuthenticatedRoleToCustomer() throws Exception {
        JwtDecoder decoder = mock(JwtDecoder.class);
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject("72a8b0a7-d05d-4a29-82b5-bdc6ef826a1c")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .claim("role", "authenticated")
                .build();
        when(decoder.decode("token")).thenReturn(jwt);

        SupabaseJwtFilter filter = new SupabaseJwtFilter(decoder);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer token");
        filter.doFilter(request, new MockHttpServletResponse(), mock(FilterChain.class));

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals(jwt.getSubject(), authentication.getName());
        assertTrue(authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_CUSTOMER")));
    }

    @Test
    void readsAdminRoleFromAppMetadata() throws Exception {
        JwtDecoder decoder = mock(JwtDecoder.class);
        Jwt jwt = Jwt.withTokenValue("admin-token")
                .header("alg", "RS256")
                .subject("72a8b0a7-d05d-4a29-82b5-bdc6ef826a1c")
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .claim("role", "authenticated")
                .claim("app_metadata", Map.of("role", "ADMIN"))
                .build();
        when(decoder.decode("admin-token")).thenReturn(jwt);

        SupabaseJwtFilter filter = new SupabaseJwtFilter(decoder);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer admin-token");
        filter.doFilter(request, new MockHttpServletResponse(), mock(FilterChain.class));

        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")));
    }
}
