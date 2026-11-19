package com.airline.domain.repository;

import com.airline.domain.entity.FlightChangeDelivery;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface FlightChangeDeliveryRepository extends JpaRepository<FlightChangeDelivery, Long> {
    @Query("SELECT d.id FROM FlightChangeDelivery d WHERE d.processed = false ORDER BY d.id")
    List<Long> findPendingIds(Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM FlightChangeDelivery d WHERE d.id = :id")
    Optional<FlightChangeDelivery> findForUpdate(@Param("id") Long id);
}
