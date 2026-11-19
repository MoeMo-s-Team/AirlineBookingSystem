package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.UpdateProfileCommand;
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
                .phone(profile.getPhone())
                .dateOfBirth(profile.getDateOfBirth())
                .passportNo(profile.getPassportNo())
                .build();
    }

    @Transactional
    public ProfileIdentity updateMyProfile(UUID id, UpdateProfileCommand command) {
        String fullName = command.fullName() == null ? "" : command.fullName().trim();
        String phone = optionalText(command.phone());
        String passport = optionalText(command.passportNo());
        if (fullName.length() < 2 || fullName.length() > 255) {
            throw new IllegalArgumentException("Full name must contain 2 to 255 characters.");
        }
        if (phone != null && (!phone.matches("[0-9+()\\s-]{7,20}") || phone.replaceAll("\\D", "").length() < 7)) {
            throw new IllegalArgumentException("Invalid phone number format.");
        }
        if (passport != null && !passport.matches("[A-Za-z0-9]{5,50}")) {
            throw new IllegalArgumentException("Passport or national ID must contain 5 to 50 letters or digits.");
        }
        if (command.dateOfBirth() != null && command.dateOfBirth().isAfter(
                java.time.LocalDate.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh")))) {
            throw new IllegalArgumentException("Date of birth cannot be in the future.");
        }
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new com.airline.presentation.exception.ResourceNotFoundException("Profile not found"));
        // Never accept role, email or user ID from the update payload.
        profile.setFullName(fullName);
        profile.setPhone(phone);
        profile.setDateOfBirth(command.dateOfBirth());
        profile.setPassportNo(passport == null ? null : passport.toUpperCase(java.util.Locale.ROOT));
        profileRepository.save(profile);
        return requireIdentity(id);
    }

    private String optionalText(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
