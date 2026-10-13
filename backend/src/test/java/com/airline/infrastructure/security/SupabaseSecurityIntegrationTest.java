package com.airline.infrastructure.security;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.service.ProfileService;
import com.airline.config.SecurityConfig;
import com.airline.config.SupabaseProperties;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@Import({SecurityConfig.class, ProfileAuthorizationFilter.class, SupabaseProperties.class})
class SupabaseSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileService profileService;

    // Mock other services required if any controllers are loaded in web slice
    @MockBean
    private com.airline.application.service.FareService fareService;
    @MockBean
    private com.airline.application.service.FlightService flightService;
    @MockBean
    private com.airline.application.service.AdditionalServiceService additionalServiceService;

    private static HttpServer jwksServer;
    private static RSAKey rsaJwk;
    private static RSAKey invalidRsaJwk;
    private static String jwksUrl;
    private static final String ISSUER = "https://project-ref.supabase.co/auth/v1";
    private static final String AUDIENCE = "authenticated";

    @BeforeAll
    static void startServer() throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);

        KeyPair kp1 = kpg.generateKeyPair();
        rsaJwk = new RSAKey.Builder((RSAPublicKey) kp1.getPublic())
                .privateKey((RSAPrivateKey) kp1.getPrivate())
                .keyID("key-1")
                .build();

        KeyPair kp2 = kpg.generateKeyPair();
        invalidRsaJwk = new RSAKey.Builder((RSAPublicKey) kp2.getPublic())
                .privateKey((RSAPrivateKey) kp2.getPrivate())
                .keyID("key-2")
                .build();

        JWKSet jwkSet = new JWKSet(rsaJwk);
        String jwksJson = jwkSet.toString(true);

        jwksServer = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        jwksServer.createContext("/auth/v1/.well-known/jwks.json", exchange -> {
            byte[] response = jwksJson.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, response.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response);
            }
        });
        jwksServer.start();

        int port = jwksServer.getAddress().getPort();
        jwksUrl = "http://127.0.0.1:" + port + "/auth/v1/.well-known/jwks.json";
    }

    @AfterAll
    static void stopServer() {
        if (jwksServer != null) {
            jwksServer.stop(0);
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("supabase.url", () -> "https://project-ref.supabase.co");
        registry.add("supabase.issuer-uri", () -> ISSUER);
        registry.add("supabase.jwks-url", () -> jwksUrl);
        registry.add("supabase.jwt-audience", () -> AUDIENCE);
    }

    private String createToken(RSAKey key, String issuer, List<String> audience, Instant exp, UUID userId) throws Exception {
        Instant issuedAt = exp.isBefore(Instant.now()) ? exp.minus(1, ChronoUnit.HOURS) : Instant.now();
        JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder()
                .subject(userId.toString())
                .issuer(issuer)
                .issueTime(Date.from(issuedAt))
                .expirationTime(Date.from(exp));

        if (audience != null) {
            builder.audience(audience);
        }

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(key.getKeyID()).build(),
                builder.build()
        );
        signedJWT.sign(new RSASSASigner(key));
        return signedJWT.serialize();
    }

    @Test
    void protectedRoute_shouldReturn401_whenNoTokenProvided() throws Exception {
        mockMvc.perform(get("/api/fares/all"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        verifyNoInteractions(profileService);
    }

    @Test
    void protectedRoute_shouldReturn401_whenInvalidSignature() throws Exception {
        String token = createToken(invalidRsaJwk, ISSUER, List.of(AUDIENCE), Instant.now().plus(1, ChronoUnit.HOURS), UUID.randomUUID());

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        verifyNoInteractions(profileService);
    }

    @Test
    void protectedRoute_shouldReturn401_whenIssuerMismatch() throws Exception {
        String token = createToken(rsaJwk, "https://wrong.issuer", List.of(AUDIENCE), Instant.now().plus(1, ChronoUnit.HOURS), UUID.randomUUID());

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        verifyNoInteractions(profileService);
    }

    @Test
    void protectedRoute_shouldReturn401_whenAudienceMismatch() throws Exception {
        String token = createToken(rsaJwk, ISSUER, List.of("other-aud"), Instant.now().plus(1, ChronoUnit.HOURS), UUID.randomUUID());

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        verifyNoInteractions(profileService);
    }

    @Test
    void protectedRoute_shouldReturn401_whenExpired() throws Exception {
        String token = createToken(rsaJwk, ISSUER, List.of(AUDIENCE), Instant.now().minus(1, ChronoUnit.HOURS), UUID.randomUUID());

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));

        verifyNoInteractions(profileService);
    }

    @Test
    void publicGet_shouldSucceedWithoutProfileLookup_evenWithValidBearerToken() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = createToken(rsaJwk, ISSUER, List.of(AUDIENCE), Instant.now().plus(1, ChronoUnit.HOURS), userId);

        mockMvc.perform(get("/api/fares")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        verifyNoInteractions(profileService);
    }

    @Test
    void protectedAdminRoute_shouldAccess_whenAdminProfileRole() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = createToken(rsaJwk, ISSUER, List.of(AUDIENCE), Instant.now().plus(1, ChronoUnit.HOURS), userId);

        when(profileService.requireIdentity(userId)).thenReturn(
                ProfileIdentity.builder()
                        .id(userId)
                        .email("admin@airline.com")
                        .fullName("Admin")
                        .role("ADMIN")
                        .build()
        );

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        verify(profileService).requireIdentity(userId);
    }
}
