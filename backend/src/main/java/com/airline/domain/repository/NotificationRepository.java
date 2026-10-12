package com.airline.domain.repository;

import com.airline.domain.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    @Query(value = """
            SELECT * FROM notifications
            WHERE user_id = :userId
            ORDER BY created_at DESC, id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Notification> findForUser(@Param("userId") UUID userId,
                                   @Param("limit") int limit,
                                   @Param("offset") int offset);

    @Query(value = """
            SELECT * FROM notifications
            WHERE user_id = :userId AND is_read = :isRead
            ORDER BY created_at DESC, id DESC
            LIMIT :limit OFFSET :offset
            """, nativeQuery = true)
    List<Notification> findForUserByReadStatus(@Param("userId") UUID userId,
                                               @Param("isRead") boolean isRead,
                                               @Param("limit") int limit,
                                               @Param("offset") int offset);

    long countByUser_Id(UUID userId);

    long countByUser_IdAndIsRead(UUID userId, Boolean isRead);

    Optional<Notification> findByIdAndUser_Id(Long id, UUID userId);
}
