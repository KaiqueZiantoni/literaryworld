package com.literaryworld.reading;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "reading_logs")
public class ReadingLog {

    @Id
    private UUID id;

    @Column(name = "user_book_id", nullable = false)
    private UUID userBookId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "current_page", nullable = false)
    private int currentPage;

    protected ReadingLog() {
        // Exigido pelo JPA
    }

    public ReadingLog(UUID id, UUID userBookId, LocalDate logDate, int currentPage) {
        this.id = id;
        this.userBookId = userBookId;
        this.logDate = logDate;
        this.currentPage = currentPage;
    }

    public void updatePage(int page) {
        this.currentPage = page;
    }

    public UUID getId() { return id; }
    public UUID getUserBookId() { return userBookId; }
    public LocalDate getLogDate() { return logDate; }
    public int getCurrentPage() { return currentPage; }
}