package com.literaryworld.reading;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_genre_stats")
@IdClass(UserGenreStatsId.class)
public class UserGenreStats {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "genre_id")
    private Short genreId;

    @Column(name = "books_finished", nullable = false)
    private int booksFinished;

    @Column(name = "pages_read", nullable = false)
    private int pagesRead;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserGenreStats() {
        // Exigido pelo JPA
    }

    public UserGenreStats(UUID userId, Short genreId) {
        this.userId = userId;
        this.genreId = genreId;
        this.booksFinished = 0;
        this.pagesRead = 0;
        this.updatedAt = Instant.now();
    }

    public void registerFinishedBook(int pages) {
        this.booksFinished++;
        this.pagesRead += pages;
        this.updatedAt = Instant.now();
    }

    public UUID getUserId() { return userId; }
    public Short getGenreId() { return genreId; }
    public int getBooksFinished() { return booksFinished; }
    public int getPagesRead() { return pagesRead; }
}