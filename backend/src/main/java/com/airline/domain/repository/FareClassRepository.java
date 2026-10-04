package com.airline.domain.repository;

import com.airline.domain.entity.FareClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FareClassRepository extends JpaRepository<FareClass, Long> {

    /**
     * Lấy danh sách tất cả hạng vé đang hoạt động (active = true)
     * Dùng cho khách hàng lựa chọn khi tìm kiếm và đặt vé
     */
    List<FareClass> findByActiveTrue();

    /**
     * Tìm hạng vé theo mã code (ví dụ: ECONOMY, PREMIUM, BUSINESS)
     */
    Optional<FareClass> findByCode(String code);

    /**
     * Kiểm tra xem mã code hạng vé đã tồn tại hay chưa (phục vụ validation khi thêm mới)
     */
    boolean existsByCode(String code);
}
