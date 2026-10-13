package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.ProfileAuthorizationException;
import com.airline.domain.entity.Profile;
import com.airline.domain.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private static final Set<String> ALLOWED_ROLES = Set.of("CUSTOMER", "ADMIN");

    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public ProfileIdentity requireIdentity(UUID id) {
        Profile profile = profileRepository.findProfileWithRoleById(id)
                .orElseThrow(() -> new ProfileAuthorizationException("PROFILE_NOT_FOUND", "Profile not found for user: " + id));

        if (profile.getRole() == null || profile.getRole().getName() == null || !ALLOWED_ROLES.contains(profile.getRole().getName())) {
            throw new ProfileAuthorizationException("PROFILE_ROLE_INVALID", "Invalid or missing role for user: " + id);
        }

        return ProfileIdentity.builder()
                .id(profile.getId())
                .email(profile.getEmail())
                .fullName(profile.getFullName())
                .role(profile.getRole().getName())
                .build();
    }
}
