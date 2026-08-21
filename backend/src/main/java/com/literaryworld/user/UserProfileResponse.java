package com.literaryworld.user;

import java.time.Instant;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String username,
        String displayName,
        String bio,
        Instant createdAt
) {}