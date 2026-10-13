package com.airline.infrastructure.security;

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
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.*;

import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class SupabaseJwtDecoderTest {

    private static HttpServer jwksServer;
    private static RSAKey rsaJwk;
    private static RSAKey otherRsaJwk;
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
        otherRsaJwk = new RSAKey.Builder((RSAPublicKey) kp2.getPublic())
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

    private JwtDecoder createDecoder() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwksUrl).build();

        OAuth2TokenValidator<Jwt> withIssuer = JwtValidators.createDefaultWithIssuer(ISSUER);
        OAuth2TokenValidator<Jwt> audienceValidator = new OAuth2TokenValidator<Jwt>() {
            @Override
            public OAuth2TokenValidatorResult validate(Jwt token) {
                if (token.getAudience() != null && token.getAudience().contains(AUDIENCE)) {
                    return OAuth2TokenValidatorResult.success();
                }
                return OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "The required audience is missing", null));
            }
        };

        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(withIssuer, audienceValidator));
        return decoder;
    }

    private String createToken(RSAKey signingKey, String issuer, List<String> audience, Instant exp) throws Exception {
        Instant issuedAt = exp.isBefore(Instant.now()) ? exp.minus(1, ChronoUnit.HOURS) : Instant.now();
        JWTClaimsSet.Builder builder = new JWTClaimsSet.Builder()
                .subject(UUID.randomUUID().toString())
                .issuer(issuer)
                .issueTime(Date.from(issuedAt))
                .expirationTime(Date.from(exp));

        if (audience != null) {
            builder.audience(audience);
        }

        SignedJWT signedJWT = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(signingKey.getKeyID()).build(),
                builder.build()
        );
        signedJWT.sign(new RSASSASigner(signingKey));
        return signedJWT.serialize();
    }

    @Test
    void decode_shouldSucceed_whenTokenIsValid() throws Exception {
        JwtDecoder decoder = createDecoder();
        String token = createToken(rsaJwk, ISSUER, List.of(AUDIENCE), Instant.now().plus(1, ChronoUnit.HOURS));

        Jwt jwt = decoder.decode(token);
        assertNotNull(jwt);
        assertEquals(ISSUER, jwt.getIssuer().toString());
        assertTrue(jwt.getAudience().contains(AUDIENCE));
    }

    @Test
    void decode_shouldFail_whenIssuerMismatch() throws Exception {
        JwtDecoder decoder = createDecoder();
        String token = createToken(rsaJwk, "https://wrong-issuer.com", List.of(AUDIENCE), Instant.now().plus(1, ChronoUnit.HOURS));

        assertThrows(JwtValidationException.class, () -> decoder.decode(token));
    }

    @Test
    void decode_shouldFail_whenAudienceMismatch() throws Exception {
        JwtDecoder decoder = createDecoder();
        String token = createToken(rsaJwk, ISSUER, List.of("wrong-audience"), Instant.now().plus(1, ChronoUnit.HOURS));

        assertThrows(JwtValidationException.class, () -> decoder.decode(token));
    }

    @Test
    void decode_shouldFail_whenTokenExpired() throws Exception {
        JwtDecoder decoder = createDecoder();
        String token = createToken(rsaJwk, ISSUER, List.of(AUDIENCE), Instant.now().minus(1, ChronoUnit.HOURS));

        assertThrows(JwtValidationException.class, () -> decoder.decode(token));
    }

    @Test
    void decode_shouldFail_whenSignatureDoesNotMatchJwks() throws Exception {
        JwtDecoder decoder = createDecoder();
        String token = createToken(otherRsaJwk, ISSUER, List.of(AUDIENCE), Instant.now().plus(1, ChronoUnit.HOURS));

        assertThrows(JwtException.class, () -> decoder.decode(token));
    }
}
