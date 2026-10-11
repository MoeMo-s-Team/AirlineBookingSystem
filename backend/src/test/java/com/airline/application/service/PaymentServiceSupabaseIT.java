package com.airline.application.service;

import com.airline.config.SupabaseProperties;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.entity.Profile;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.domain.repository.ProfileRepository;
import com.airline.presentation.dto.request.PaymentRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@EnabledIfEnvironmentVariable(named = "RUN_SUPABASE_INTEGRATION_TESTS", matches = "true")
class PaymentServiceSupabaseIT {

    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();

    @Autowired
    private PaymentService paymentService;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private PaymentRepository paymentRepository;
    @Autowired
    private FlightRepository flightRepository;
    @Autowired
    private FareClassRepository fareClassRepository;
    @Autowired
    private ProfileRepository profileRepository;
    @Autowired
    private SupabaseProperties supabaseProperties;
    @Autowired
    private ObjectMapper objectMapper;
    @PersistenceContext
    private EntityManager entityManager;

    private UUID userId;
    private Long bookingId;
    private Long flightId;
    private Long fareClassId;

    @BeforeEach
    void setUp() throws Exception {
        userId = createTemporaryUser();
        Profile user = profileRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Supabase profile trigger did not create the test profile"));
        String suffix = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Flight flight = flightRepository.saveAndFlush(Flight.builder()
                .flightNumber("IT-" + suffix)
                .origin("HAN")
                .destination("SGN")
                .departureTime(LocalDateTime.now().plusDays(30))
                .arrivalTime(LocalDateTime.now().plusDays(30).plusHours(2))
                .basePrice(new BigDecimal("1000000.00"))
                .availableSeats(10)
                .build());
        FareClass fareClass = fareClassRepository.saveAndFlush(FareClass.builder()
                .code("IT" + suffix)
                .name("Integration Test " + suffix)
                .priceMultiplier(BigDecimal.ONE)
                .active(true)
                .build());
        Booking booking = bookingRepository.saveAndFlush(Booking.builder()
                .bookingCode("IT-" + suffix)
                .user(user)
                .flight(flight)
                .fareClass(fareClass)
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("1500000.00"))
                .build());
        bookingId = booking.getId();
        flightId = flight.getId();
        fareClassId = fareClass.getId();
    }

    @AfterEach
    void tearDown() throws Exception {
        if (bookingId != null) {
            List<com.airline.domain.entity.Payment> payments = paymentRepository.findByBookingId(bookingId);
            paymentRepository.deleteAll(payments);
            paymentRepository.flush();
            bookingRepository.deleteById(bookingId);
        }
        if (flightId != null) {
            flightRepository.deleteById(flightId);
        }
        if (fareClassId != null) {
            fareClassRepository.deleteById(fareClassId);
        }
        if (userId != null) {
            deleteTemporaryUser(userId);
        }
    }

    @Test
    void creditCardPaymentPersistsSuccessAndConfirmsBooking() {
        var response = paymentService.processPayment(userId,
                PaymentRequest.builder().bookingId(bookingId).paymentMethod("CREDIT_CARD").build());

        entityManager.clear();
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(response.getTransactionRef()).startsWith("TXN-");
        assertThat(response.getPaidAt()).isNotNull();
        assertThat(bookingRepository.findById(bookingId).orElseThrow().getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(paymentRepository.findByBookingId(bookingId)).singleElement().satisfies(payment -> {
            assertThat(payment.getAmount()).isEqualByComparingTo("1500000.00");
            assertThat(payment.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        });
    }

    @Test
    void mockPaymentPersistsFailureAndMarksBookingFailed() {
        var response = paymentService.processPayment(userId,
                PaymentRequest.builder().bookingId(bookingId).paymentMethod("MOCK").build());

        entityManager.clear();
        assertThat(response.getStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(response.getTransactionRef()).isNull();
        assertThat(response.getPaidAt()).isNull();
        assertThat(bookingRepository.findById(bookingId).orElseThrow().getStatus()).isEqualTo(BookingStatus.PAYMENT_FAILED);
        assertThat(paymentRepository.findByBookingId(bookingId)).singleElement()
                .extracting("status").isEqualTo(PaymentStatus.FAILED);
    }

    private UUID createTemporaryUser() throws Exception {
        String email = "it-payment-" + UUID.randomUUID() + "@example.test";
        String body = objectMapper.writeValueAsString(java.util.Map.of(
                "email", email,
                "email_confirm", true,
                "user_metadata", java.util.Map.of("full_name", "Integration Test")));
        HttpResponse<String> response = HTTP_CLIENT.send(HttpRequest.newBuilder(adminUsersUri())
                .header("apikey", supabaseProperties.getSecretKey())
                .header("Authorization", "Bearer " + supabaseProperties.getSecretKey())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) {
            throw new IllegalStateException("Supabase test-user creation failed: HTTP " + response.statusCode());
        }
        JsonNode user = objectMapper.readTree(response.body());
        return UUID.fromString(user.path("id").asText());
    }

    private void deleteTemporaryUser(UUID id) throws Exception {
        HttpResponse<String> response = HTTP_CLIENT.send(HttpRequest.newBuilder(URI.create(adminUsersUri() + "/" + id))
                .header("apikey", supabaseProperties.getSecretKey())
                .header("Authorization", "Bearer " + supabaseProperties.getSecretKey())
                .DELETE()
                .build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) {
            throw new IllegalStateException("Supabase test-user cleanup failed: HTTP " + response.statusCode());
        }
    }

    private URI adminUsersUri() {
        return URI.create(supabaseProperties.getUrl() + "/auth/v1/admin/users");
    }
}
