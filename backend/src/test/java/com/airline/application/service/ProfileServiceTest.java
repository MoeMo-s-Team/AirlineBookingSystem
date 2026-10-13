package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.exception.ProfileAuthorizationException;
import com.airline.domain.entity.Profile;
import com.airline.domain.entity.Role;
import com.airline.domain.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    private ProfileService profileService;

    @BeforeEach
    void setUp() {
        profileService = new ProfileService(profileRepository);
    }

    @Test
    void requireIdentity_shouldReturnIdentity_whenCustomerRole() {
        UUID id = UUID.randomUUID();
        Profile profile = Profile.builder()
                .id(id)
                .email("user@example.com")
                .fullName("John Doe")
                .role(Role.builder().name("CUSTOMER").build())
                .build();

        when(profileRepository.findProfileWithRoleById(id)).thenReturn(Optional.of(profile));

        ProfileIdentity identity = profileService.requireIdentity(id);

        assertNotNull(identity);
        assertEquals(id, identity.getId());
        assertEquals("user@example.com", identity.getEmail());
        assertEquals("John Doe", identity.getFullName());
        assertEquals("CUSTOMER", identity.getRole());
    }

    @Test
    void requireIdentity_shouldReturnIdentity_whenAdminRole() {
        UUID id = UUID.randomUUID();
        Profile profile = Profile.builder()
                .id(id)
                .email("admin@airline.com")
                .fullName("Admin User")
                .role(Role.builder().name("ADMIN").build())
                .build();

        when(profileRepository.findProfileWithRoleById(id)).thenReturn(Optional.of(profile));

        ProfileIdentity identity = profileService.requireIdentity(id);

        assertNotNull(identity);
        assertEquals(id, identity.getId());
        assertEquals("admin@airline.com", identity.getEmail());
        assertEquals("Admin User", identity.getFullName());
        assertEquals("ADMIN", identity.getRole());
    }

    @Test
    void requireIdentity_shouldThrowProfileNotFound_whenProfileDoesNotExist() {
        UUID id = UUID.randomUUID();
        when(profileRepository.findProfileWithRoleById(id)).thenReturn(Optional.empty());

        ProfileAuthorizationException exception = assertThrows(
                ProfileAuthorizationException.class,
                () -> profileService.requireIdentity(id)
        );

        assertEquals("PROFILE_NOT_FOUND", exception.getCode());
    }

    @Test
    void requireIdentity_shouldThrowProfileRoleInvalid_whenRoleIsNull() {
        UUID id = UUID.randomUUID();
        Profile profile = Profile.builder()
                .id(id)
                .email("norole@example.com")
                .fullName("No Role")
                .role(null)
                .build();

        when(profileRepository.findProfileWithRoleById(id)).thenReturn(Optional.of(profile));

        ProfileAuthorizationException exception = assertThrows(
                ProfileAuthorizationException.class,
                () -> profileService.requireIdentity(id)
        );

        assertEquals("PROFILE_ROLE_INVALID", exception.getCode());
    }

    @Test
    void requireIdentity_shouldThrowProfileRoleInvalid_whenRoleNameIsUnknown() {
        UUID id = UUID.randomUUID();
        Profile profile = Profile.builder()
                .id(id)
                .email("unknown@example.com")
                .fullName("Unknown Role")
                .role(Role.builder().name("SUPERUSER").build())
                .build();

        when(profileRepository.findProfileWithRoleById(id)).thenReturn(Optional.of(profile));

        ProfileAuthorizationException exception = assertThrows(
                ProfileAuthorizationException.class,
                () -> profileService.requireIdentity(id)
        );

        assertEquals("PROFILE_ROLE_INVALID", exception.getCode());
    }
}
