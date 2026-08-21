package com.literaryworld.user;

import java.util.List;

public record WorldResponse(
        String username,
        String displayName,
        List<GenreDensity> genres,
        List<WorldBook> books
) {
    public record GenreDensity(String slug, String name, int booksFinished, int pagesRead) {}

    public record WorldBook(String title, String coverUrl, String status, int progressPercent) {}
}