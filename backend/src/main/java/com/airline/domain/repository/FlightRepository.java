package com.airline.domain.repository;

import com.airline.domain.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    List<Flight> findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
            String origin,
            String destination,
            LocalDateTime startOfDay,
            LocalDateTime startOfNextDay);

    boolean existsByFlightNumberIgnoreCase(String flightNumber);

    boolean existsByFlightNumberIgnoreCaseAndIdNot(String flightNumber, Long id);
}
