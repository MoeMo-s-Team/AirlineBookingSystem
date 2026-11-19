package com.airline.application.service;

import com.airline.application.dto.*;
import com.airline.domain.entity.*;
import com.airline.domain.repository.*;
import com.airline.pattern.observer.BookingSubject;
import com.airline.pattern.strategy.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

@ExtendWith(MockitoExtension.class)
class RoundTripBookingServiceTest {
    @Mock BookingRepository bookings;
    @Mock FlightRepository flights;
    @Mock FareClassRepository fares;
    @Mock ServiceRepository services;
    @Mock ProfileRepository profiles;
    @Mock BookingSubject subject;
    @Mock PricingStrategyFactory strategies;
    BookingService service;
    ProfileIdentity principal;
    Flight outbound;
    Flight inbound;
    FareClass fare;
    BookingHoldService holds;
    final LocalDateTime now = LocalDateTime.of(2026, 12, 1, 10, 0);

    @BeforeEach void setUp() {
        holds = new BookingHoldService(flights, bookings, subject,
                Clock.fixed(now.atZone(ZoneId.of("Asia/Ho_Chi_Minh")).toInstant(), ZoneId.of("Asia/Ho_Chi_Minh")));
        service = new BookingService(bookings, flights, fares, services, profiles, subject, strategies, new PricingContext(), holds, new BookingPricingService());
        principal = ProfileIdentity.builder().id(UUID.randomUUID()).build();
        outbound = Flight.builder().id(20L).flightNumber("OUT20").origin("SGN").destination("HAN")
                .departureTime(now.plusDays(1)).arrivalTime(now.plusDays(1).plusHours(2))
                .basePrice(new BigDecimal("1000000")).availableSeats(3).build();
        inbound = Flight.builder().id(10L).flightNumber("RET10").origin("HAN").destination("SGN")
                .departureTime(now.plusDays(2)).arrivalTime(now.plusDays(2).plusHours(2))
                .basePrice(new BigDecimal("1500000")).availableSeats(4).build();
        fare = FareClass.builder().id(1L).code("ECONOMY").name("Economy").active(true).priceMultiplier(BigDecimal.ONE).build();
    }

    CreateBookingCommand request() {
        return new CreateBookingCommand(20L, 1L, List.of(
                new CreateBookingCommand.PassengerInput("A", LocalDate.of(1990, 1, 1), "P1", "090"),
                new CreateBookingCommand.PassengerInput("B", LocalDate.of(1990, 1, 1), "P2", "091")), List.of(), 10L, 1L);
    }

    void stubFlights() {
        when(profiles.findById(principal.getId())).thenReturn(Optional.of(Profile.builder().id(principal.getId()).build()));
        when(flights.findByIdForUpdate(10L)).thenReturn(Optional.of(inbound));
        when(flights.findByIdForUpdate(20L)).thenReturn(Optional.of(outbound));
    }

    void stubPricing() {
        when(fares.findById(1L)).thenReturn(Optional.of(fare));
        when(strategies.getStrategy("ECONOMY", fare.getPriceMultiplier())).thenReturn(new EconomyPricingStrategy());
    }

    @Test void pricesFirstClassOutboundAndCustomPromotionalReturnUsingRealStrategies() {
        stubFlights();
        var first = FareClass.builder().id(4L).code("FIRST_CLASS").name("First Class")
                .active(true).priceMultiplier(new BigDecimal("3.50")).build();
        var promo = FareClass.builder().id(5L).code("PROMO_RETURN").name("Promo")
                .active(true).priceMultiplier(new BigDecimal("0.80")).build();
        when(fares.findById(4L)).thenReturn(Optional.of(first));
        when(fares.findById(5L)).thenReturn(Optional.of(promo));
        when(bookings.save(any())).thenAnswer(call -> {
            Booking b = call.getArgument(0); b.setId(100L); return b;
        });
        var realStrategies = new PricingStrategyFactory(new EconomyPricingStrategy(), new PremiumPricingStrategy(),
                new BusinessPricingStrategy(), new FirstClassPricingStrategy());
        var realService = new BookingService(bookings, flights, fares, services, profiles, subject,
                realStrategies, new PricingContext(), holds, new BookingPricingService());
        var command = request();
        var result = realService.createBooking(principal, new CreateBookingCommand(20L, 4L,
                command.passengers(), List.of(), 10L, 5L));
        assertThat(result.totalPrice()).isEqualByComparingTo("9400000.00");
        assertThat(result.fareClass().code()).isEqualTo("FIRST_CLASS");
        assertThat(result.returnFareClass().code()).isEqualTo("PROMO_RETURN");
    }

    @Test void createsOneBookingWithCombinedPriceAndSeatsOnBothFlights() {
        stubFlights(); stubPricing();
        FareClass returnFare = FareClass.builder().id(2L).code("BUSINESS").name("Business")
                .active(true).priceMultiplier(new BigDecimal("2")).build();
        when(fares.findById(2L)).thenReturn(Optional.of(returnFare));
        when(strategies.getStrategy("BUSINESS", returnFare.getPriceMultiplier())).thenReturn(new BusinessPricingStrategy());
        when(bookings.save(any())).thenAnswer(call -> {
            Booking booking = call.getArgument(0); booking.setId(100L); return booking;
        });
        var command = request();
        BookingView result = service.createBooking(principal, new CreateBookingCommand(command.flightId(), command.fareClassId(),
                command.passengers(), command.services(), command.returnFlightId(), 2L));
        assertThat(result.totalPrice()).isEqualByComparingTo("8000000");
        assertThat(result.returnFlight().id()).isEqualTo(10L);
        assertThat(result.returnFareClass().id()).isEqualTo(2L);
        assertThat(result.expiresAt()).isEqualTo(now.plusMinutes(15));
        assertThat(outbound.getAvailableSeats()).isEqualTo(1);
        assertThat(inbound.getAvailableSeats()).isEqualTo(2);
        var order = inOrder(flights);
        order.verify(flights).findByIdForUpdate(10L);
        order.verify(flights).findByIdForUpdate(20L);
        verify(bookings).save(any());
        verify(subject).publishStatusChanged(any(), isNull());
    }

    @Test void rejectsWrongRouteBeforeHoldingAnySeats() {
        stubFlights(); inbound.setDestination("DAD");
        assertThatThrownBy(() -> service.createBooking(principal, request())).isInstanceOf(IllegalArgumentException.class);
        assertThat(outbound.getAvailableSeats()).isEqualTo(3);
        verifyNoInteractions(bookings, subject);
    }

    @Test void rejectsReturnDepartureBeforeOutboundArrival() {
        stubFlights(); inbound.setDepartureTime(outbound.getArrivalTime());
        assertThatThrownBy(() -> service.createBooking(principal, request())).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(bookings, subject);
    }

    @Test void rejectsIncompleteReturnSelection() {
        when(profiles.findById(principal.getId())).thenReturn(Optional.of(Profile.builder().id(principal.getId()).build()));
        CreateBookingCommand command = new CreateBookingCommand(20L, 1L, request().passengers(), List.of(), 10L, null);
        assertThatThrownBy(() -> service.createBooking(principal, command)).isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(flights, bookings);
    }

    @Test void releaseRefundsBothFlightsOnceInIdOrder() {
        when(flights.findByIdForUpdate(10L)).thenReturn(Optional.of(inbound));
        when(flights.findByIdForUpdate(20L)).thenReturn(Optional.of(outbound));
        Booking booking = Booking.builder().flight(outbound).returnFlight(inbound).seatsHeld(true)
                .passengers(List.of(Passenger.builder().build(), Passenger.builder().build())).build();
        holds.release(booking); holds.release(booking);
        assertThat(outbound.getAvailableSeats()).isEqualTo(5);
        assertThat(inbound.getAvailableSeats()).isEqualTo(6);
        var order = inOrder(flights);
        order.verify(flights).findByIdForUpdate(10L);
        order.verify(flights).findByIdForUpdate(20L);
        verify(flights, times(1)).findByIdForUpdate(20L);
    }
}
