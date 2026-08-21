package com.literaryworld.reading;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserBookRepository extends JpaRepository<UserBook, UUID> {

    Optional<UserBook> findByIdAndUserId(UUID id, UUID userId);

    Optional<UserBook> findByUserIdAndBookId(UUID userId, UUID bookId);

    List<UserBook> findAllByUserId(UUID userId);
    @Query("""
        SELECT new com.literaryworld.reading.ShelfItemResponse(
            ub.id, b.id, b.title, b.authors, b.coverUrl, b.pageCount,
            ub.status, ub.currentPage, ub.startedAt, ub.finishedAt
        )
        FROM UserBook ub
        JOIN Book b ON b.id = ub.bookId
        WHERE ub.userId = :userId
        ORDER BY ub.createdAt DESC
        """)
    List<ShelfItemResponse> findShelfWithBooks(@Param("userId") UUID userId);
}
