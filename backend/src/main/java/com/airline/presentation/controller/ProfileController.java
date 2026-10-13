package com.airline.presentation.controller;

import com.airline.infrastructure.security.ProfilePrincipal;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.ProfileMeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile", description = "APIs thông tin người dùng hiện tại")
public class ProfileController {

    @GetMapping("/me")
    @Operation(summary = "Lấy thông tin profile của người dùng hiện tại từ token")
    public ResponseEntity<ApiResponse<ProfileMeResponse>> getMyProfile(
            @AuthenticationPrincipal ProfilePrincipal principal) {

        ProfileMeResponse response = ProfileMeResponse.builder()
                .id(principal.getId())
                .email(principal.getEmail())
                .fullName(principal.getFullName())
                .role(principal.getRole())
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
