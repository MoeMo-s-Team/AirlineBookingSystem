package com.airline.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CyclicBarrier;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.airline.application.dto.ProcessPaymentCommand;
import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.BookingConflictException;
import com.airline.domain.entity.Booking;
import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.entity.Profile;
import com.airline.domain.entity.Role;
import com.airline.domain.enums.BookingStatus;
import com.airline.domain.repository.BookingRepository;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.domain.repository.ProfileRepository;
import com.airline.pattern.observer.BookingSubject;

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
        registry.add("booking.hold.cleanup-interval-ms", () -> "3600000");
        registry.add("flight.notifications.interval-ms", () -> "3600000");
    }

    @Autowired
    private BookingService bookingService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private com.airline.domain.repository.RoleRepository roleRepository;

    @Autowired
    private FlightRepository flightRepository;

    @Autowired
    private FareClassRepository fareClassRepository;
    @Autowired private FlightService flightService;
    @Autowired private com.airline.domain.repository.FlightChangeDeliveryRepository flightDeliveries;
    @Autowired private com.airline.domain.repository.NotificationRepository notifications;
    @Autowired private FlightChangeDeliveryService flightDeliveryService;

    @Autowired
    private BookingHoldService bookingHoldService;

    @MockBean
    private BookingSubject bookingSubject;

    @Test
    void concurrentPayAndCancel_exactlyOneWins() throws Exception {
        UUID userId = UUID.randomUUID();
        Role role = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("CUSTOMER").build()));
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

    private record Fixture(ProfileIdentity principal, Flight flight, FareClass fare) {}

    private Fixture fixture(int seats) {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        Role role = roleRepository.findByName("CUSTOMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("CUSTOMER").build()));
        Profile profile = profileRepository.save(Profile.builder().id(UUID.randomUUID())
                .email(suffix + "@holds.test").fullName("Hold Test").role(role).build());
        LocalDateTime departure = bookingHoldService.now().plusDays(5);
        Flight flight = flightRepository.save(Flight.builder().flightNumber("H" + suffix)
                .origin("SGN").destination("HAN").departureTime(departure).arrivalTime(departure.plusHours(2))
                .basePrice(new BigDecimal("1000000")).availableSeats(seats).build());
        FareClass fare = fareClassRepository.save(FareClass.builder().code("ECO_" + suffix)
                .name("Hold fare").priceMultiplier(BigDecimal.ONE).active(true).build());
        return new Fixture(ProfileIdentity.builder().id(profile.getId()).email(profile.getEmail())
                .role("CUSTOMER").build(), flight, fare);
    }

    private com.airline.application.dto.CreateBookingCommand request(Fixture fixture) {
        return new com.airline.application.dto.CreateBookingCommand(fixture.flight().getId(), fixture.fare().getId(),
                java.util.List.of(new com.airline.application.dto.CreateBookingCommand.PassengerInput(
                        "Test Passenger", java.time.LocalDate.of(1990, 1, 1), "P12345", "0901234567")), java.util.List.of());
    }

    @Test
    void concurrentLastSeatReservationAllowsOnlyOneBooking() throws Exception {
        Fixture fixture = fixture(1);
        CyclicBarrier barrier = new CyclicBarrier(2);
        java.util.concurrent.Callable<Boolean> reserve = () -> {
            barrier.await(10, TimeUnit.SECONDS);
            try {
                bookingService.createBooking(fixture.principal(), request(fixture));
                return true;
            } catch (IllegalArgumentException ex) {
                assertEquals("Insufficient Seats", ex.getMessage());
                return false;
            }
        };
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            Future<Boolean> first = executor.submit(reserve);
            Future<Boolean> second = executor.submit(reserve);
            assertEquals(1, (first.get(15, TimeUnit.SECONDS) ? 1 : 0) + (second.get(15, TimeUnit.SECONDS) ? 1 : 0));
        }
        assertEquals(0, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
        assertEquals(1, bookingRepository.findByUserIdOrderByCreatedAtDesc(fixture.principal().getId()).size());
    }

    private Long expiredBooking(Fixture fixture) {
        Long id = bookingService.createBooking(fixture.principal(), request(fixture)).id();
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setExpiresAt(bookingHoldService.now().minusSeconds(1));
        bookingRepository.save(booking);
        return id;
    }

    @Test
    void expiredPaymentCommitsCancellationAndRefundDespiteReturningConflict() {
        Fixture fixture = fixture(2);
        Long id = expiredBooking(fixture);
        org.junit.jupiter.api.Assertions.assertThrows(com.airline.application.exception.BookingExpiredException.class,
                () -> paymentService.processPayment(fixture.principal(), new ProcessPaymentCommand(id, "MOCK")));
        assertEquals(BookingStatus.CANCELLED, bookingRepository.findById(id).orElseThrow().getStatus());
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
        bookingHoldService.expireBooking(id);
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
    }

    @Test
    void concurrentCleanupAndPaymentRefundOnlyOnce() throws Exception {
        Fixture fixture = fixture(2);
        Long id = expiredBooking(fixture);
        CyclicBarrier barrier = new CyclicBarrier(2);
        try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
            Future<?> cleanup = executor.submit(() -> {
                try { barrier.await(10, TimeUnit.SECONDS); }
                catch (Exception ex) { throw new RuntimeException(ex); }
                bookingHoldService.expireBooking(id);
            });
            Future<?> payment = executor.submit(() -> {
                try { barrier.await(10, TimeUnit.SECONDS); }
                catch (Exception ex) { throw new RuntimeException(ex); }
                org.junit.jupiter.api.Assertions.assertThrows(BookingConflictException.class,
                        () -> paymentService.processPayment(fixture.principal(), new ProcessPaymentCommand(id, "MOCK")));
            });
            cleanup.get(15, TimeUnit.SECONDS);
            payment.get(15, TimeUnit.SECONDS);
        }
        assertEquals(BookingStatus.CANCELLED, bookingRepository.findById(id).orElseThrow().getStatus());
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
    }

    @Test
    void failedCreationRollsBackSeatReservation() {
        Fixture fixture = fixture(2);
        org.mockito.Mockito.doThrow(new IllegalStateException("notification storage failed"))
                .when(bookingSubject).publishStatusChanged(any(), org.mockito.ArgumentMatchers.isNull());
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class,
                () -> bookingService.createBooking(fixture.principal(), request(fixture)));
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
        assertEquals(0, bookingRepository.findByUserIdOrderByCreatedAtDesc(fixture.principal().getId()).size());
    }

    private Flight returnFlight(Fixture fixture, int seats) {
        LocalDateTime departure = fixture.flight().getArrivalTime().plusDays(2);
        return flightRepository.save(Flight.builder().flightNumber("R" + UUID.randomUUID().toString().substring(0, 8))
                .origin("HAN").destination("SGN").departureTime(departure).arrivalTime(departure.plusHours(2))
                .basePrice(new BigDecimal("1500000")).availableSeats(seats).build());
    }

    private com.airline.application.dto.CreateBookingCommand roundTripRequest(Fixture fixture, Flight inbound) {
        var outbound = request(fixture);
        return new com.airline.application.dto.CreateBookingCommand(outbound.flightId(), outbound.fareClassId(),
                outbound.passengers(), outbound.services(), inbound.getId(), fixture.fare().getId());
    }

    @Test
    void insufficientReturnSeatsRollBackOutboundReservation() {
        Fixture fixture = fixture(2);
        Flight inbound = returnFlight(fixture, 0);
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(fixture.principal(), roundTripRequest(fixture, inbound)));
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
        assertEquals(0, flightRepository.findById(inbound.getId()).orElseThrow().getAvailableSeats());
        assertEquals(0, bookingRepository.findByUserIdOrderByCreatedAtDesc(fixture.principal().getId()).size());
    }

    @Test
    void roundTripCancellationRefundsBothLegsWithoutDoubleRefund() {
        Fixture fixture = fixture(2);
        Flight inbound = returnFlight(fixture, 3);
        Long id = bookingService.createBooking(fixture.principal(), roundTripRequest(fixture, inbound)).id();
        assertEquals(1, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
        assertEquals(2, flightRepository.findById(inbound.getId()).orElseThrow().getAvailableSeats());
        bookingService.cancelBooking(fixture.principal(), id);
        org.junit.jupiter.api.Assertions.assertThrows(BookingConflictException.class,
                () -> bookingService.cancelBooking(fixture.principal(), id));
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
        assertEquals(3, flightRepository.findById(inbound.getId()).orElseThrow().getAvailableSeats());
    }

    @Test
    void roundTripExpiryRefundsBothLegs() {
        Fixture fixture = fixture(2);
        Flight inbound = returnFlight(fixture, 3);
        Long id = bookingService.createBooking(fixture.principal(), roundTripRequest(fixture, inbound)).id();
        Booking booking = bookingRepository.findById(id).orElseThrow();
        booking.setExpiresAt(bookingHoldService.now().minusSeconds(1));
        bookingRepository.save(booking);
        bookingHoldService.expireBooking(id);
        bookingHoldService.expireBooking(id);
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
        assertEquals(3, flightRepository.findById(inbound.getId()).orElseThrow().getAvailableSeats());
    }

    @Test
    void cancelledFlightCannotBePaidAndPendingSeatsAreRefunded() {
        Fixture fixture = fixture(2);
        Long id = bookingService.createBooking(fixture.principal(), request(fixture)).id();
        flightService.updateFlight(fixture.flight().getId(), com.airline.presentation.dto.request.FlightUpdateRequest.builder()
                .status(com.airline.domain.enums.FlightStatus.CANCELLED).build());
        org.junit.jupiter.api.Assertions.assertThrows(BookingConflictException.class,
                () -> paymentService.processPayment(fixture.principal(), new ProcessPaymentCommand(id, "MOCK")));
        assertEquals(BookingStatus.CANCELLED, bookingRepository.findById(id).orElseThrow().getStatus());
        assertEquals(2, flightRepository.findById(fixture.flight().getId()).orElseThrow().getAvailableSeats());
    }

    @Test
    void cancellationNotificationIsDeliveredOnceAndDoesNotPretendToRefundPaidBooking() {
        Fixture fixture = fixture(2);
        Long id = bookingService.createBooking(fixture.principal(), request(fixture)).id();
        paymentService.processPayment(fixture.principal(), new ProcessPaymentCommand(id, "MOCK"));
        flightService.updateFlight(fixture.flight().getId(), com.airline.presentation.dto.request.FlightUpdateRequest.builder()
                .status(com.airline.domain.enums.FlightStatus.CANCELLED).build());
        Long deliveryId = flightDeliveries.findPendingIds(org.springframework.data.domain.PageRequest.of(0, 100)).stream()
                .filter(delivery -> flightDeliveries.findById(delivery).orElseThrow().getFlightId().equals(fixture.flight().getId()))
                .findFirst().orElseThrow();
        flightDeliveryService.deliver(deliveryId);
        flightDeliveryService.deliver(deliveryId);
        assertEquals(1, notifications.countByUser_Id(fixture.principal().getId()));
        assertEquals(BookingStatus.CONFIRMED, bookingRepository.findById(id).orElseThrow().getStatus());
    }
}
