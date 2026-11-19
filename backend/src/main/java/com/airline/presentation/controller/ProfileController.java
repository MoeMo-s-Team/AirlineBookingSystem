package com.airline.presentation.controller;

import com.airline.application.dto.ProfileIdentity;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.ProfileMeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.airline.application.service.ProfileService;
import com.airline.application.dto.UpdateProfileCommand;
import com.airline.presentation.dto.request.ProfileUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "APIs thông tin người dùng hiện tại")
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin profile của người dùng hiện tại từ token")
    public ResponseEntity<ApiResponse<ProfileMeResponse>> getMyProfile(
            @AuthenticationPrincipal ProfileIdentity principal) {

        ProfileMeResponse response = ProfileMeResponse.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .fullName(principal.getFullName())
                .role(principal.getRole())
                .phone(principal.getPhone())
                .dateOfBirth(principal.getDateOfBirth())
                .passportNo(principal.getPassportNo())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    @Operation(summary = "Update the authenticated user's personal profile")
    public ResponseEntity<ApiResponse<ProfileMeResponse>> updateMyProfile(
            @AuthenticationPrincipal ProfileIdentity principal,
            @Valid @RequestBody ProfileUpdateRequest request) {
        ProfileIdentity updated = profileService.updateMyProfile(principal.getId(),
                new UpdateProfileCommand(request.getFullName(), request.getPhone(), request.getDateOfBirth(), request.getPassportNo()));
        return getMyProfile(updated);
    }
}
