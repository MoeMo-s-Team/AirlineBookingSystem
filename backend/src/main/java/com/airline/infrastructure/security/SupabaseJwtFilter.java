package com.airline.infrastructure.security;

import com.airline.config.SupabaseProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SupabaseJwtFilter extends OncePerRequestFilter {

    private final SupabaseProperties supabaseProperties;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7);

        try {
            SecretKey key = Keys.hmacShaKeyFor(supabaseProperties.getSecretKey().getBytes(StandardCharsets.UTF_8));

            Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

            String userId = claims.getSubject();
            String role = claims.get("role", String.class);

            // Supabase Auth mặc định để role="authenticated", kiểm tra thêm trong app_metadata hoặc user_metadata
            if (role == null || role.isBlank() || "authenticated".equalsIgnoreCase(role)) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> appMetadata = claims.get("app_metadata", java.util.Map.class);
                if (appMetadata != null && appMetadata.containsKey("role")) {
                    role = String.valueOf(appMetadata.get("role"));
                }
            }
            if (role == null || role.isBlank() || "authenticated".equalsIgnoreCase(role)) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> userMetadata = claims.get("user_metadata", java.util.Map.class);
                if (userMetadata != null && userMetadata.containsKey("role")) {
                    role = String.valueOf(userMetadata.get("role"));
                }
            }

            if (role == null || role.isBlank() || "authenticated".equalsIgnoreCase(role)) {
                role = "CUSTOMER";
            }

            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userId, null, authorities);

            SecurityContextHolder.getContext().setAuthentication(authentication);

        } catch (Exception e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
