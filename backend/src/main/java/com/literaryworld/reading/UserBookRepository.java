package com.literaryworld.reading;

import com.literaryworld.user.WorldResponse;
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
                ub.status, ub.currentPage, ub.startedAt, ub.finishedAt,
                MIN(g.slug)
            )
            FROM UserBook ub
            JOIN Book b ON b.id = ub.bookId
            LEFT JOIN b.genres g
            WHERE ub.userId = :userId
            GROUP BY ub.id, b.id, b.title, b.authors, b.coverUrl, b.pageCount,
                     ub.status, ub.currentPage, ub.startedAt, ub.finishedAt, ub.createdAt
            ORDER BY ub.createdAt DESC
            """)
    List<ShelfItemResponse> findShelfWithBooks(@Param("userId") UUID userId);

    @Query("""
            SELECT new com.literaryworld.reading.ShelfItemResponse(
                ub.id, b.id, b.title, b.authors, b.coverUrl, b.pageCount,
                ub.status, ub.currentPage, ub.startedAt, ub.finishedAt,
                MIN(g.slug)
            )
            FROM UserBook ub
            JOIN Book b ON b.id = ub.bookId
            LEFT JOIN b.genres g
            WHERE ub.id = :userBookId AND ub.userId = :userId
            GROUP BY ub.id, b.id, b.title, b.authors, b.coverUrl, b.pageCount,
                     ub.status, ub.currentPage, ub.startedAt, ub.finishedAt
            """)
    Optional<ShelfItemResponse> findShelfItem(@Param("userBookId") UUID userBookId,
                                              @Param("userId") UUID userId);

    @Query("""
            SELECT new com.literaryworld.user.WorldResponse$WorldBook(
                b.id,
                b.title,
                COALESCE(b.coverUrl, ''),
                CAST(ub.status AS string),
                CASE WHEN b.pageCount IS NULL OR b.pageCount = 0 THEN 0
                     ELSE CAST((ub.currentPage * 100.0 / b.pageCount) AS integer) END,
                MIN(g.slug),
                r.rating,
                r.body,
                r.spoiler
            )
            FROM UserBook ub
            JOIN Book b ON b.id = ub.bookId
            LEFT JOIN b.genres g
            LEFT JOIN Review r ON r.bookId = b.id AND r.userId = ub.userId
            WHERE ub.userId = :userId
            GROUP BY ub.id, b.id, b.title, b.coverUrl, ub.status, ub.currentPage, b.pageCount,
                     r.rating, r.body, r.spoiler, ub.createdAt
            ORDER BY ub.createdAt DESC
            """)
    List<WorldResponse.WorldBook> findWorldBooks(@Param("userId") UUID userId);
}