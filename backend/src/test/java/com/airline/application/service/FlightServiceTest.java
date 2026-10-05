package com.airline.application.service;

import com.airline.domain.entity.FareClass;
import com.airline.domain.entity.Flight;
import com.airline.domain.repository.FareClassRepository;
import com.airline.domain.repository.FlightRepository;
import com.airline.presentation.dto.request.FlightRequest;
import com.airline.presentation.dto.request.FlightUpdateRequest;
import com.airline.presentation.dto.response.FlightResponse;
import com.airline.presentation.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FlightServiceTest {

    @Mock
    private FlightRepository flightRepository;

    @Mock
    private FareClassRepository fareClassRepository;

    private FlightService flightService;

    @BeforeEach
    void setUp() {
        flightService = new FlightService(flightRepository, fareClassRepository);
    }

    @Test
    void searchFlightsUsesExactDayAndCalculatesPrices() {
        LocalDate date = LocalDate.of(2026, 12, 25);
        Flight flight = sampleFlight();
        when(flightRepository
                .findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
                        "HAN", "SGN", date.atStartOfDay(), date.plusDays(1).atStartOfDay()))
                .thenReturn(List.of(flight));
        when(fareClassRepository.findByActiveTrue()).thenReturn(sampleFares());

        List<FlightResponse> result = flightService.searchFlights(" han ", "sgn", date);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().getPrices())
                .containsEntry("economy", new BigDecimal("1200000.00"))
                .containsEntry("premium", new BigDecimal("1800000.00"))
                .containsEntry("business", new BigDecimal("3000000.00"));
    }

    @Test
    void createFlightNormalizesCodesBeforeSaving() {
        FlightRequest request = FlightRequest.builder()
                .flightNumber(" vn1234 ")
                .origin(" han ")
                .destination("sgn")
                .departureTime(LocalDateTime.now().plusDays(2))
                .arrivalTime(LocalDateTime.now().plusDays(2).plusHours(2))
                .basePrice(new BigDecimal("1200000"))
                .availableSeats(100)
                .build();
        when(flightRepository.existsByFlightNumberIgnoreCase("VN1234")).thenReturn(false);
        when(flightRepository.save(any(Flight.class))).thenAnswer(invocation -> {
            Flight saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });
        when(fareClassRepository.findByActiveTrue()).thenReturn(sampleFares());

        flightService.createFlight(request);

        ArgumentCaptor<Flight> captor = ArgumentCaptor.forClass(Flight.class);
        verify(flightRepository).save(captor.capture());
        assertThat(captor.getValue().getFlightNumber()).isEqualTo("VN1234");
        assertThat(captor.getValue().getOrigin()).isEqualTo("HAN");
        assertThat(captor.getValue().getDestination()).isEqualTo("SGN");
    }

    @Test
    void updateFlightRejectsArrivalBeforeDeparture() {
        Flight flight = sampleFlight();
        when(flightRepository.findById(1L)).thenReturn(Optional.of(flight));
        FlightUpdateRequest request = FlightUpdateRequest.builder()
                .arrivalTime(flight.getDepartureTime().minusMinutes(1))
                .build();

        assertThatThrownBy(() -> flightService.updateFlight(1L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Thời gian đến phải sau thời gian khởi hành");
        verify(flightRepository, never()).save(any());
    }

    @Test
    void deleteFlightReturnsNotFoundForUnknownId() {
        when(flightRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> flightService.deleteFlight(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Không tìm thấy chuyến bay với ID: 99");
        verify(flightRepository, never()).delete(any());
    }

    private Flight sampleFlight() {
        return Flight.builder()
                .id(1L)
                .flightNumber("VN1234")
                .origin("HAN")
                .destination("SGN")
                .departureTime(LocalDateTime.of(2026, 12, 25, 6, 0))
                .arrivalTime(LocalDateTime.of(2026, 12, 25, 8, 30))
                .basePrice(new BigDecimal("1200000"))
                .availableSeats(45)
                .build();
    }

    private List<FareClass> sampleFares() {
        return List.of(
                fare(1L, "ECONOMY", "1.0"),
                fare(2L, "PREMIUM", "1.5"),
                fare(3L, "BUSINESS", "2.5"));
    }

    private FareClass fare(Long id, String code, String multiplier) {
        return FareClass.builder()
                .id(id)
                .code(code)
                .name(code)
                .priceMultiplier(new BigDecimal(multiplier))
                .active(true)
                .build();
    }
}
