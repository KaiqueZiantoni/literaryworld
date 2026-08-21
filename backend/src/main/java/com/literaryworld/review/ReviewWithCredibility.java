package com.literaryworld.review;

import java.time.Instant;
import java.util.UUID;

public record ReviewWithCredibility(
        UUID id,
        String username,
        String displayName,
        short rating,
        String body,
        boolean spoiler,
        long credibility,
        Instant createdAt,
        Instant updatedAt
) {}