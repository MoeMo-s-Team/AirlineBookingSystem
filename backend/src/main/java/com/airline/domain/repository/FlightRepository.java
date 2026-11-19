package com.airline.domain.repository;

import com.airline.domain.entity.Flight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlightRepository extends JpaRepository<Flight, Long> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("SELECT f FROM Flight f WHERE f.id = :id")
    java.util.Optional<Flight> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") Long id);

    List<Flight> findByOriginIgnoreCaseAndDestinationIgnoreCaseAndDepartureTimeGreaterThanEqualAndDepartureTimeLessThanOrderByDepartureTimeAsc(
            String origin,
            String destination,
            LocalDateTime startOfDay,
            LocalDateTime startOfNextDay);

    boolean existsByFlightNumberIgnoreCase(String flightNumber);

    boolean existsByFlightNumberIgnoreCaseAndIdNot(String flightNumber, Long id);
}
