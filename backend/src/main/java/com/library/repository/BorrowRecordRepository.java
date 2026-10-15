package com.library.repository;

import com.library.model.BorrowRecord;
import com.library.model.RecordStatus;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUserEmailIgnoreCaseOrderByBorrowedAtDesc(String email);
    List<BorrowRecord> findAllByOrderByBorrowedAtDesc();
    long countByStatus(RecordStatus status);
    boolean existsByBookId(Long bookId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from BorrowRecord r where r.id = :id")
    Optional<BorrowRecord> findByIdForUpdate(@Param("id") Long id);
}
