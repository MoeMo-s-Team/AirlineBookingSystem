package com.airline.config;

import com.airline.infrastructure.security.ProfileAuthorizationFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final SupabaseProperties supabaseProperties;
    private final ProfileAuthorizationFilter profileAuthorizationFilter;
    private final ObjectMapper objectMapper;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(Customizer.withDefaults())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(authenticationEntryPoint())
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                // Admin specific paths under /api/fares and /api/services
                .requestMatchers(HttpMethod.GET, "/api/fares/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/fares/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/fares/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/fares/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/services/all").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/services/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/services/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/services/**").hasRole("ADMIN")
                // Flights CRUD admin
                .requestMatchers(HttpMethod.POST, "/api/flights/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/flights/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/flights/**").hasRole("ADMIN")
                // Public GET endpoints
                .requestMatchers(HttpMethod.GET, "/api/flights/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/fares/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/services/**").permitAll()
                // Admin catch-all
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
                .authenticationEntryPoint(authenticationEntryPoint())
            )
            .addFilterAfter(profileAuthorizationFilter, BearerTokenAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        String jwksUrl = supabaseProperties.getJwksUrl();
        if (jwksUrl == null || jwksUrl.isBlank()) {
            String baseUrl = supabaseProperties.getUrl();
            if (baseUrl != null && !baseUrl.isBlank()) {
                jwksUrl = baseUrl.replaceAll("/+$", "") + "/auth/v1/.well-known/jwks.json";
            }
        }

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUrl)
                .jwsAlgorithms(algs -> {
                    algs.add(org.springframework.security.oauth2.jose.jws.SignatureAlgorithm.RS256);
                    algs.add(org.springframework.security.oauth2.jose.jws.SignatureAlgorithm.ES256);
                })
                .build();

        String issuer = supabaseProperties.getIssuerUri();
        if (issuer == null || issuer.isBlank()) {
            String baseUrl = supabaseProperties.getUrl();
            if (baseUrl != null && !baseUrl.isBlank()) {
                issuer = baseUrl.replaceAll("/+$", "") + "/auth/v1";
            }
        }

        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(issuer);

        String requiredAudience = supabaseProperties.getJwtAudience();
        OAuth2TokenValidator<Jwt> audienceValidator = new OAuth2TokenValidator<Jwt>() {
            @Override
            public OAuth2TokenValidatorResult validate(Jwt token) {
                if (token.getAudience() != null && token.getAudience().contains(requiredAudience)) {
                    return OAuth2TokenValidatorResult.success();
                }
                return OAuth2TokenValidatorResult.failure(
                        new OAuth2Error("invalid_token", "The required audience '" + requiredAudience + "' is missing", null)
                );
            }
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator));
        return decoder;
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setStatus(401);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");

            Map<String, Object> body = Map.of(
                    "success", false,
                    "code", "UNAUTHORIZED",
                    "message", "Unauthorized: " + authException.getMessage()
            );

            response.getWriter().write(objectMapper.writeValueAsString(body));
        };
    }
}
