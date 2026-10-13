package com.airline.domain.repository;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByIdAndUserId(Long id, UUID userId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Booking b WHERE b.id = :id AND b.user.id = :userId")
    Optional<Booking> findByIdAndUserIdForUpdate(@Param("id") Long id, @Param("userId") UUID userId);

    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, BookingStatus status);

    @Query("SELECT b FROM Booking b WHERE (:status IS NULL OR b.status = :status) AND (:userId IS NULL OR b.user.id = :userId)")
    Page<Booking> findWithFilters(@Param("status") BookingStatus status, @Param("userId") UUID userId, Pageable pageable);

    boolean existsByBookingCode(String bookingCode);
}
