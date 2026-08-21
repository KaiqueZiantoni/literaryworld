package com.literaryworld.reading;

import com.literaryworld.user.WorldResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface UserGenreStatsRepository extends JpaRepository<UserGenreStats, UserGenreStatsId> {

    List<UserGenreStats> findAllByUserId(UUID userId);
    @Query("""
        SELECT new com.literaryworld.user.WorldResponse$GenreDensity(
            g.slug, g.name, s.booksFinished, s.pagesRead
        )
        FROM UserGenreStats s
        JOIN Genre g ON g.id = s.genreId
        WHERE s.userId = :userId
        ORDER BY s.booksFinished DESC, s.pagesRead DESC
        """)
    List<WorldResponse.GenreDensity> findGenreDensity(@Param("userId") UUID userId);
}