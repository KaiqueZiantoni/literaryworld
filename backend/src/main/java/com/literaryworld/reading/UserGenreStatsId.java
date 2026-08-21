package com.literaryworld.reading;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class UserGenreStatsId implements Serializable {

    private UUID userId;
    private Short genreId;

    public UserGenreStatsId() {
    }

    public UserGenreStatsId(UUID userId, Short genreId) {
        this.userId = userId;
        this.genreId = genreId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserGenreStatsId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(genreId, that.genreId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, genreId);
    }
}