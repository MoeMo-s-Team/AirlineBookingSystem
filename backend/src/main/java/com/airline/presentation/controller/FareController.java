package com.airline.presentation.controller;

import com.airline.application.service.FareService;
import com.airline.presentation.dto.request.FareClassRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.FareClassResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fares")
@RequiredArgsConstructor
@Tag(name = "Fare Class", description = "APIs quản lý và lựa chọn hạng vé")
public class FareController {

    private final FareService fareService;

    @GetMapping
    @Operation(summary = "Lấy danh sách các hạng vé đang mở bán (Public)")
    public ResponseEntity<ApiResponse<List<FareClassResponse>>> getAllActiveFares() {
        List<FareClassResponse> fares = fareService.getAllActiveFares();
        return ResponseEntity.ok(ApiResponse.success(fares));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy toàn bộ danh sách hạng vé gồm cả active và inactive (Admin)")
    public ResponseEntity<ApiResponse<List<FareClassResponse>>> getAllFares() {
        List<FareClassResponse> fares = fareService.getAllFares();
        return ResponseEntity.ok(ApiResponse.success(fares));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem thông tin chi tiết một hạng vé theo ID (Public)")
    public ResponseEntity<ApiResponse<FareClassResponse>> getFareById(@PathVariable Long id) {
        FareClassResponse fare = fareService.getFareById(id);
        return ResponseEntity.ok(ApiResponse.success(fare));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thêm mới một hạng vé (Admin)")
    public ResponseEntity<ApiResponse<FareClassResponse>> createFare(@Valid @RequestBody FareClassRequest request) {
        FareClassResponse created = fareService.createFare(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo hạng vé thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin hạng vé (Admin)")
    public ResponseEntity<ApiResponse<FareClassResponse>> updateFare(
            @PathVariable Long id,
            @Valid @RequestBody FareClassRequest request) {
        FareClassResponse updated = fareService.updateFare(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật hạng vé thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa hạng vé (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteFare(@PathVariable Long id) {
        fareService.deleteFare(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa hạng vé thành công", null));
    }
}
