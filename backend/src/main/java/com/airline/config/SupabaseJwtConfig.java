package com.airline.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

@Configuration
@RequiredArgsConstructor
public class SupabaseJwtConfig {

    private final SupabaseProperties supabaseProperties;

    @Bean
    JwtDecoder supabaseJwtDecoder() {
        String jwksUrl = supabaseProperties.getJwksUrl();
        if (jwksUrl == null || jwksUrl.isBlank()) {
            throw new IllegalStateException("SUPABASE_JWKS_URL chưa được cấu hình");
        }
        return NimbusJwtDecoder.withJwkSetUri(jwksUrl).build();
    }
}
