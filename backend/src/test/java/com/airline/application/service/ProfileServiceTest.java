package com.airline.application.service;

import com.airline.application.dto.ProfileIdentity;
import com.airline.application.dto.UpdateProfileCommand;
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
import static org.mockito.Mockito.*;

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

    @Test
    void updateProfileNormalizesDetailsAndPreservesIdentityAndRole() {
        UUID id = UUID.randomUUID();
        Profile profile = Profile.builder().id(id).email("original@example.com").fullName("Old Name")
                .role(Role.builder().name("CUSTOMER").build()).build();
        when(profileRepository.findById(id)).thenReturn(Optional.of(profile));
        when(profileRepository.findProfileWithRoleById(id)).thenReturn(Optional.of(profile));
        var dob = java.time.LocalDate.of(1990, 1, 1);
        var result = profileService.updateMyProfile(id, new UpdateProfileCommand("  New Name  ", " 0901234567 ", dob, " ab12345 "));
        assertEquals("New Name", result.getFullName());
        assertEquals("0901234567", result.getPhone());
        assertEquals(dob, result.getDateOfBirth());
        assertEquals("AB12345", result.getPassportNo());
        assertEquals("original@example.com", result.getEmail());
        assertEquals("CUSTOMER", result.getRole());
        assertEquals(id, result.getId());
        verify(profileRepository).save(profile);
    }

    @Test
    void updateProfileAllowsClearingOptionalDetails() {
        UUID id = UUID.randomUUID();
        Profile profile = Profile.builder().id(id).fullName("Name").phone("0901234567").passportNo("AB12345")
                .dateOfBirth(java.time.LocalDate.of(1990, 1, 1)).role(Role.builder().name("CUSTOMER").build()).build();
        when(profileRepository.findById(id)).thenReturn(Optional.of(profile));
        when(profileRepository.findProfileWithRoleById(id)).thenReturn(Optional.of(profile));
        var result = profileService.updateMyProfile(id, new UpdateProfileCommand("Name", " ", null, ""));
        assertNull(result.getPhone());
        assertNull(result.getPassportNo());
        assertNull(result.getDateOfBirth());
    }

    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.ValueSource(strings = {"123", "abcdefg", "+++++++", "09012345678901234567890"})
    void invalidPhoneIsRejectedWithoutWriting(String phone) {
        assertThrows(IllegalArgumentException.class, () -> profileService.updateMyProfile(UUID.randomUUID(),
                new UpdateProfileCommand("Valid Name", phone, null, null)));
        verifyNoInteractions(profileRepository);
    }

    @Test
    void rejectsInvalidTravelIdAndFutureBirthDate() {
        assertThrows(IllegalArgumentException.class, () -> profileService.updateMyProfile(UUID.randomUUID(),
                new UpdateProfileCommand("Valid Name", null, null, "<script>")));
        assertThrows(IllegalArgumentException.class, () -> profileService.updateMyProfile(UUID.randomUUID(),
                new UpdateProfileCommand("Valid Name", null, java.time.LocalDate.now().plusYears(1), null)));
        verifyNoInteractions(profileRepository);
    }
}
