package com.airline.config;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.service.ProfileService;
import com.airline.infrastructure.security.ProfileAuthorizationFilter;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest
@Import({SecurityConfig.class, ProfileAuthorizationFilter.class, SupabaseProperties.class})
class SecurityConfigRouteTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProfileService profileService;

    @MockBean
    private com.airline.application.service.FareService fareService;
    @MockBean
    private com.airline.application.service.FlightService flightService;
    @MockBean
    private com.airline.application.service.AdditionalServiceService additionalServiceService;
    @MockBean
    private com.airline.application.service.BookingService bookingService;
    @MockBean
    private com.airline.application.service.PaymentService paymentService;
    @MockBean
    private com.airline.application.service.NotificationService notificationService;

    private static HttpServer jwksServer;
    private static RSAKey rsaJwk;
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

    private String createToken(UUID userId) throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(userId.toString())
                .issuer(ISSUER)
                .audience(List.of(AUDIENCE))
                .issueTime(Date.from(Instant.now()))
                .expirationTime(Date.from(Instant.now().plus(1, ChronoUnit.HOURS)))
                .build();

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(rsaJwk.getKeyID()).build(),
                claims
        );
        signedJWT.sign(new RSASSASigner(rsaJwk));
        return signedJWT.serialize();
    }

    @Test
    void publicRoutes_shouldSucceedAnonymously() throws Exception {
        mockMvc.perform(get("/api/flights")
                        .param("origin", "HAN")
                        .param("destination", "SGN")
                        .param("date", "2026-10-20"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/fares")).andExpect(status().isOk());
        mockMvc.perform(get("/api/services")).andExpect(status().isOk());
    }

    @Test
    void profileMe_shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/profile/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void devTokenRoute_shouldNotExist() throws Exception {
        UUID adminId = UUID.randomUUID();
        String adminToken = createToken(adminId);
        when(profileService.requireIdentity(adminId)).thenReturn(
                ProfileIdentity.builder().id(adminId).email("a@airline.com").fullName("Admin").role("ADMIN").build()
        );

        // Even with valid admin token, /api/fares/dev-token cannot return dev token
        mockMvc.perform(get("/api/fares/dev-token")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(result -> org.junit.jupiter.api.Assertions.assertNotEquals(200, result.getResponse().getStatus()));
    }

    @Test
    void adminRoutes_shouldRejectCustomerAndAcceptAdmin() throws Exception {
        UUID customerId = UUID.randomUUID();
        String customerToken = createToken(customerId);
        when(profileService.requireIdentity(customerId)).thenReturn(
                ProfileIdentity.builder().id(customerId).email("c@airline.com").fullName("Cust").role("CUSTOMER").build()
        );

        // Customer trying admin route /api/fares/all
        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // Admin trying admin route /api/fares/all
        UUID adminId = UUID.randomUUID();
        String adminToken = createToken(adminId);
        when(profileService.requireIdentity(adminId)).thenReturn(
                ProfileIdentity.builder().id(adminId).email("a@airline.com").fullName("Admin").role("ADMIN").build()
        );

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void dynamicRoleChange_sameTokenAcrossRequests_shouldReflectNewRoleImmediately() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = createToken(userId);

        // Request 1: User is CUSTOMER in database -> forbidden on admin route
        when(profileService.requireIdentity(userId)).thenReturn(
                ProfileIdentity.builder().id(userId).email("u@airline.com").fullName("User").role("CUSTOMER").build()
        );

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // Database role changes to ADMIN -> next request with SAME token is accepted
        when(profileService.requireIdentity(userId)).thenReturn(
                ProfileIdentity.builder().id(userId).email("u@airline.com").fullName("User").role("ADMIN").build()
        );

        mockMvc.perform(get("/api/fares/all")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
