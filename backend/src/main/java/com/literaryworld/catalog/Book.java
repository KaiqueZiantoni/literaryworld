package com.literaryworld.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "books")
public class Book {

    @Id
    private UUID id;

    @Column(name = "google_books_id", nullable = false, unique = true, length = 20)
    private String googleBooksId;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, length = 500)
    private String authors;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(length = 10)
    private String language;

    @Column(name = "cover_url", length = 500)
    private String coverUrl;

    @Column(name = "cached_at", nullable = false)
    private Instant cachedAt;

    @Column(name = "added_by")
    private UUID addedBy;

    protected Book() {
        // Exigido pelo JPA
    }

    public Book(UUID id, String googleBooksId, String title, String authors,
                Integer pageCount, String language, String coverUrl, UUID addedBy) {
        this.id = id;
        this.googleBooksId = googleBooksId;
        this.title = title;
        this.authors = authors;
        this.pageCount = pageCount;
        this.language = language;
        this.coverUrl = coverUrl;
        this.addedBy = addedBy;
        this.cachedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public String getGoogleBooksId() { return googleBooksId; }
    public String getTitle() { return title; }
    public String getAuthors() { return authors; }
    public Integer getPageCount() { return pageCount; }
    public String getLanguage() { return language; }
    public String getCoverUrl() { return coverUrl; }
    public UUID getAddedBy() { return addedBy; }
}