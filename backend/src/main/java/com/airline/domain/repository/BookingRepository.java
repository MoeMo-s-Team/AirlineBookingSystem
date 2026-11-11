package com.airline.domain.repository;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
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

    @EntityGraph(attributePaths = {"user", "flight", "fareClass"})
    Page<Booking> findByStatus(BookingStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "flight", "fareClass"})
    Page<Booking> findByUserId(UUID userId, Pageable pageable);

    @EntityGraph(attributePaths = {"user", "flight", "fareClass"})
    Page<Booking> findByStatusAndUserId(BookingStatus status, UUID userId, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"user", "flight", "fareClass"})
    Page<Booking> findAll(Pageable pageable);

    default Page<Booking> findWithFilters(BookingStatus status, UUID userId, Pageable pageable) {
        if (status != null && userId != null) {
            return findByStatusAndUserId(status, userId, pageable);
        } else if (status != null) {
            return findByStatus(status, pageable);
        } else if (userId != null) {
            return findByUserId(userId, pageable);
        }
        return findAll(pageable);
    }

    boolean existsByBookingCode(String bookingCode);

    boolean existsByFlightId(Long flightId);
}
