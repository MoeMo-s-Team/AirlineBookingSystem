package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.ProcessPaymentCommand;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.*;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.enums.PaymentStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.domain.repository.PaymentRepository;
import com.airline.domain.repository.ProfileRepository;
import com.airline.pattern.observer.BookingSubject;
import com.airline.presentation.dto.request.PaymentRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@org.junit.jupiter.api.condition.EnabledIf("isDatabaseAvailable")
class BookingPaymentConcurrencyTest {

    static boolean isDatabaseAvailable() {
        try (java.net.Socket socket = new java.net.Socket()) {
            socket.connect(new java.net.InetSocketAddress("localhost", 5433), 500);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:postgresql://localhost:5433/airline_test");
        registry.add("spring.datasource.username", () -> "postgres");
        registry.add("spring.datasource.password", () -> "postgres");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("supabase.url", () -> "https://dummy.supabase.co");
        registry.add("supabase.jwt-audience", () -> "authenticated");
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private com.airline.domain.repository.RoleRepository roleRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FareClassRepository fareClassRepository;

    @MockBean
    private BookingSubject bookingSubject;

    @Test
    void concurrentPayAndCancel_exactlyOneWins() throws Exception {
        UUID userId = UUID.randomUUID();
        Role role = roleRepository.save(Role.builder().name("CUSTOMER").build());
        Profile profile = profileRepository.save(Profile.builder()
                .id(userId)
                .email("user@concurrency.test")
                .fullName("Concurrency User")
                .role(role)
                .build());

        Flight flight = flightRepository.save(Flight.builder()
                .flightNumber("CC101")
                .origin("HAN")
                .destination("SGN")
                .departureTime(LocalDateTime.now().plusDays(5))
                .arrivalTime(LocalDateTime.now().plusDays(5).plusHours(2))
                .basePrice(new BigDecimal("1000000.00"))
                .availableSeats(100)
                .build());

        FareClass fareClass = fareClassRepository.save(FareClass.builder()
                .code("ECONOMY_CC")
                .name("ECONOMY_CC")
                .priceMultiplier(new BigDecimal("1.00"))
                .active(true)
                .build());

        Booking booking = bookingRepository.save(Booking.builder()
                .bookingCode("BKCONCUR1")
                .user(profile)
                .flight(flight)
                .fareClass(fareClass)
                .status(BookingStatus.PENDING)
                .totalPrice(new BigDecimal("1000000.00"))
                .build());

        ProfileIdentity principal = ProfileIdentity.builder()
                .id(userId)
                .email("user@concurrency.test")
                .role("CUSTOMER")
                .build();

        CyclicBarrier barrier = new CyclicBarrier(2);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        Future<?> f1 = executor.submit(() -> {
            try {
                barrier.await();
                paymentService.processPayment(principal, new ProcessPaymentCommand(booking.getId(), "CREDIT_CARD"));
                successCount.incrementAndGet();
            } catch (BookingConflictException e) {
                conflictCount.incrementAndGet();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });

        Future<?> f2 = executor.submit(() -> {
            try {
                barrier.await();
                bookingService.cancelBooking(principal, booking.getId());
                successCount.incrementAndGet();
            } catch (BookingConflictException e) {
                conflictCount.incrementAndGet();
            } catch (Exception e) {
                e.printStackTrace();
            }
        });

        f1.get(15, TimeUnit.SECONDS);
        f2.get(15, TimeUnit.SECONDS);
        executor.shutdown();

        assertEquals(1, successCount.get(), "Exactly one concurrent operation must succeed");
        assertEquals(1, conflictCount.get(), "The losing concurrent operation must receive BookingConflictException");

        Booking finalBooking = bookingRepository.findById(booking.getId()).orElseThrow();
        assertTrue(finalBooking.getStatus() == BookingStatus.CONFIRMED || finalBooking.getStatus() == BookingStatus.CANCELLED);

        // Observer was notified exactly once for the pay or cancel status transition
        verify(bookingSubject, times(1)).publishStatusChanged(any(Booking.class), eq(BookingStatus.PENDING));
    }
}
