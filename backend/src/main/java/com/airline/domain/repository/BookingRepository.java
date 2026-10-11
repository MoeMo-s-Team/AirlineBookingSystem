package com.airline.domain.repository;

import com.airline.domain.entity.Booking;
import com.airline.domain.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    Optional<Booking> findByBookingCode(String bookingCode);

    boolean existsByBookingCode(String bookingCode);

    List<Booking> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, BookingStatus status);
}
