package com.literaryworld.reading;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface UserGenreStatsRepository extends JpaRepository<UserGenreStats, UserGenreStatsId> {

    List<UserGenreStats> findAllByUserId(UUID userId);
}