package com.literaryworld.reading;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_books")
public class UserBook {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "book_id", nullable = false)
    private UUID bookId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReadingStatus status;

    @Column(name = "current_page", nullable = false)
    private int currentPage;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "finished_at")
    private Instant finishedAt;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected UserBook() {
        // Exigido pelo JPA
    }

    public UserBook(UUID id, UUID userId, UUID bookId, ReadingStatus status) {
        this.id = id;
        this.userId = userId;
        this.bookId = bookId;
        this.status = status;
        this.currentPage = 0;
        this.createdAt = Instant.now();
        if (status == ReadingStatus.LENDO) {
            this.startedAt = Instant.now();
        }
    }

    public void updateProgress(int page) {
        this.currentPage = page;
        if (this.status == ReadingStatus.QUERO_LER) {
            this.status = ReadingStatus.LENDO;
            this.startedAt = Instant.now();
        }
    }

    public void finish() {
        this.status = ReadingStatus.LIDO;
        this.finishedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getBookId() { return bookId; }
    public ReadingStatus getStatus() { return status; }
    public int getCurrentPage() { return currentPage; }
    public Instant getStartedAt() { return startedAt; }
    public Instant getFinishedAt() { return finishedAt; }
}