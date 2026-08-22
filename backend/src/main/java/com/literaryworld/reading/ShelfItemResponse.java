package com.literaryworld.reading;

import java.time.Instant;
import java.util.UUID;

public record ShelfItemResponse(
        UUID id,
        UUID bookId,
        String title,
        String authors,
        String coverUrl,
        Integer pageCount,
        ReadingStatus status,
        int currentPage,
        Instant startedAt,
        Instant finishedAt,
        String genreSlug
) {}