package com.literaryworld.user;

import java.util.List;
import java.util.UUID;

public record WorldResponse(
        String username,
        String displayName,
        List<GenreDensity> genres,
        List<WorldBook> books
) {
    public record GenreDensity(String slug, String name, int booksFinished, int pagesRead) {}

    /** Par (livro, gênero) usado para reconstituir a lista de gêneros de cada livro. */
    public record BookGenre(UUID bookId, String slug) {}

    public record WorldBook(
            UUID bookId,
            String title,
            String coverUrl,
            String status,
            int progressPercent,
            String genreSlug,
            List<String> genreSlugs,
            Short reviewRating,
            String reviewBody,
            Boolean reviewSpoiler
    ) {
        /**
         * Construtor usado pela projeção JPQL. A lista de gêneros não sai da mesma
         * consulta — um livro tem até cinco, e agregá-los ali multiplicaria as linhas
         * do resultado. Ela é costurada depois, por {@link #withGenres(List)}.
         */
        public WorldBook(UUID bookId, String title, String coverUrl, String status, int progressPercent,
                         String genreSlug, Short reviewRating, String reviewBody, Boolean reviewSpoiler) {
            this(bookId, title, coverUrl, status, progressPercent, genreSlug,
                    genreSlug == null ? List.of() : List.of(genreSlug),
                    reviewRating, reviewBody, reviewSpoiler);
        }

        public WorldBook withGenres(List<String> slugs) {
            if (slugs == null || slugs.isEmpty()) {
                return this;
            }
            return new WorldBook(bookId, title, coverUrl, status, progressPercent,
                    slugs.getFirst(), List.copyOf(slugs), reviewRating, reviewBody, reviewSpoiler);
        }
    }
}
