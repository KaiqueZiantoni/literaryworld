package com.literaryworld.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserBookRepository extends JpaRepository<UserBook, UUID> {

    Optional<UserBook> findByIdAndUserId(UUID id, UUID userId);

    Optional<UserBook> findByUserIdAndBookId(UUID userId, UUID bookId);

    List<UserBook> findAllByUserId(UUID userId);
}