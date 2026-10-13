package com.airline.infrastructure.security;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.ProfileAuthorizationException;
import com.airline.application.service.ProfileService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileAuthorizationFilter extends OncePerRequestFilter {

    private final ProfileService profileService;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if (path.startsWith("/api-docs") || path.startsWith("/swagger-ui")) {
            return true;
        }

        if ("GET".equalsIgnoreCase(method)) {
            if (path.equals("/api/fares/all") || path.equals("/api/services/all")) {
                return false;
            }
            if (path.startsWith("/api/flights") || path.startsWith("/api/fares") || path.startsWith("/api/services")) {
                return true;
            }
        }

        return false;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        var auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            String sub = jwtAuth.getName();
            UUID userId;
            try {
                userId = UUID.fromString(sub);
            } catch (IllegalArgumentException e) {
                SecurityContextHolder.clearContext();
                writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, "PROFILE_NOT_FOUND", "Invalid user subject UUID");
                return;
            }

            try {
                ProfileIdentity identity = profileService.requireIdentity(userId);

                ProfilePrincipal principal = ProfilePrincipal.builder()
                        .id(identity.getId())
                        .email(identity.getEmail())
                        .fullName(identity.getFullName())
                        .role(identity.getRole())
                        .build();

                List<SimpleGrantedAuthority> authorities = List.of(
                        new SimpleGrantedAuthority("ROLE_" + identity.getRole())
                );

                UsernamePasswordAuthenticationToken authenticated =
                        new UsernamePasswordAuthenticationToken(principal, jwtAuth.getToken(), authorities);

                SecurityContextHolder.getContext().setAuthentication(authenticated);

            } catch (ProfileAuthorizationException pae) {
                SecurityContextHolder.clearContext();
                writeErrorResponse(response, HttpServletResponse.SC_FORBIDDEN, pae.getCode(), pae.getMessage());
                return;
            } catch (DataAccessException dae) {
                log.error("Database error while loading profile for user {}: {}", userId, dae.getMessage());
                SecurityContextHolder.clearContext();
                writeErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "PROFILE_LOOKUP_FAILED", "Database error loading profile");
                return;
            } catch (Exception e) {
                log.error("Unexpected error loading profile for user {}: {}", userId, e.getMessage());
                SecurityContextHolder.clearContext();
                writeErrorResponse(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "PROFILE_LOOKUP_FAILED", "Error loading profile");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private void writeErrorResponse(HttpServletResponse response, int status, String code, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = Map.of(
                "success", false,
                "code", code,
                "message", message
        );

        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
