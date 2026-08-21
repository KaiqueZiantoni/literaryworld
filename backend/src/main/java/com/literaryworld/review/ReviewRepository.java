package com.literaryworld.review;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Optional<Review> findByUserIdAndBookId(UUID userId, UUID bookId);
    @Query("""
        SELECT new com.literaryworld.review.ReviewWithCredibility(
            r.id, u.username, u.displayName, r.rating, r.body, r.spoiler,
            COALESCE(SUM(s.booksFinished), 0),
            r.createdAt, r.updatedAt
        )
        FROM Review r
        JOIN User u ON u.id = r.userId
        JOIN Book b ON b.id = r.bookId
        LEFT JOIN b.genres g
        LEFT JOIN UserGenreStats s ON s.userId = r.userId AND s.genreId = g.id
        WHERE r.bookId = :bookId
        GROUP BY r.id, u.username, u.displayName, r.rating, r.body, r.spoiler, r.createdAt, r.updatedAt
        ORDER BY COALESCE(SUM(s.booksFinished), 0) DESC, r.createdAt DESC
        """)
    List<ReviewWithCredibility> findByBookOrderedByCredibility(@Param("bookId") UUID bookId);
}