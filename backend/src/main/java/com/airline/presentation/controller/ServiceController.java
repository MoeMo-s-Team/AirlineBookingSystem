package com.airline.presentation.controller;

import com.airline.application.service.AdditionalServiceService;
import com.airline.domain.enums.ServiceType;
import com.airline.presentation.dto.request.ServiceRequest;
import com.airline.presentation.dto.response.ApiResponse;
import com.airline.presentation.dto.response.ServiceResponse;
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
@RequestMapping("/api/services")
@RequiredArgsConstructor
@Tag(name = "Additional Service", description = "APIs quản lý và lựa chọn dịch vụ đi kèm")
public class ServiceController {

    private final AdditionalServiceService additionalServiceService;

    @GetMapping
    @Operation(summary = "Lấy danh sách các dịch vụ đi kèm đang hoạt động (Public)")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllActiveServices(
            @RequestParam(required = false) ServiceType type) {
        List<ServiceResponse> services;
        if (type != null) {
            services = additionalServiceService.getServicesByType(type);
        } else {
            services = additionalServiceService.getAllActiveServices();
        }
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Lấy toàn bộ danh sách dịch vụ đi kèm gồm cả active và inactive (Admin)")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAllServices() {
        List<ServiceResponse> services = additionalServiceService.getAllServices();
        return ResponseEntity.ok(ApiResponse.success(services));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Xem thông tin chi tiết một dịch vụ theo ID (Public)")
    public ResponseEntity<ApiResponse<ServiceResponse>> getServiceById(@PathVariable Long id) {
        ServiceResponse service = additionalServiceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success(service));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Thêm mới một dịch vụ bổ trợ (Admin)")
    public ResponseEntity<ApiResponse<ServiceResponse>> createService(@Valid @RequestBody ServiceRequest request) {
        ServiceResponse created = additionalServiceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo dịch vụ thành công", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cập nhật thông tin dịch vụ bổ trợ (Admin)")
    public ResponseEntity<ApiResponse<ServiceResponse>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody ServiceRequest request) {
        ServiceResponse updated = additionalServiceService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ thành công", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa dịch vụ bổ trợ (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        additionalServiceService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa dịch vụ thành công", null));
    }
}
