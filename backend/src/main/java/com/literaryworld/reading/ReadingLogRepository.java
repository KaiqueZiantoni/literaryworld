package com.literaryworld.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface ReadingLogRepository extends JpaRepository<ReadingLog, UUID> {

    Optional<ReadingLog> findByUserBookIdAndLogDate(UUID userBookId, LocalDate logDate);
    void deleteAllByUserBookId(UUID userBookId);
}