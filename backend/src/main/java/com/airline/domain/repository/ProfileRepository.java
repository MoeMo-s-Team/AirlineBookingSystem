package com.airline.domain.repository;

import com.airline.domain.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    @Query("SELECT p FROM Profile p LEFT JOIN FETCH p.role WHERE p.id = :id")
    Optional<Profile> findProfileWithRoleById(@Param("id") UUID id);
}
