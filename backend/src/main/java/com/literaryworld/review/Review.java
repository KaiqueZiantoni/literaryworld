package com.literaryworld.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "book_id", nullable = false)
    private UUID bookId;

    @Column(nullable = false)
    private short rating;

    @Column(nullable = false, length = 1000)
    private String body;

    @Column(name = "is_spoiler", nullable = false)
    private boolean spoiler;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    protected Review() {
        // Exigido pelo JPA
    }

    public Review(UUID id, UUID userId, UUID bookId, short rating, String body, boolean spoiler) {
        this.id = id;
        this.userId = userId;
        this.bookId = bookId;
        this.rating = rating;
        this.body = body;
        this.spoiler = spoiler;
        this.createdAt = Instant.now();
    }

    public void edit(short rating, String body, boolean spoiler) {
        this.rating = rating;
        this.body = body;
        this.spoiler = spoiler;
        this.updatedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public UUID getBookId() { return bookId; }
    public short getRating() { return rating; }
    public String getBody() { return body; }
    public boolean isSpoiler() { return spoiler; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}