package com.literaryworld.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true, columnDefinition = "citext")
    private String username;

    @Column(name = "display_name", nullable = false, length = 60)
    private String displayName;

    @Column(length = 300)
    private String bio;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    protected User() {
        // Exigido pelo JPA
    }

    public User(UUID id, String username, String displayName) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getUsername() { return username; }
    public String getDisplayName() { return displayName; }
    public String getBio() { return bio; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getDeletedAt() { return deletedAt; }
}