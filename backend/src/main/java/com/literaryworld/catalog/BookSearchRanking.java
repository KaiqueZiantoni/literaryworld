package com.literaryworld.catalog;

import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Reordena o que a Google Books devolve.
 *
 * <p>A relevância da fonte é ruim para busca curta: "duna" traz dicionário de
 * planejamento urbano e cabeçalhos da Biblioteca do Congresso antes de
 * <i>Duna: Casa Atreides</i>, porque ela casa o termo no texto inteiro do volume.
 * Aqui o que vale é o que o leitor digitou aparecer no <b>título</b> — e, depois
 * dele, no autor.
 *
 * <p>Reordenar é de propósito, em vez de filtrar: um livro que só casa no subtítulo
 * continua alcançável, só desce na lista.
 */
final class BookSearchRanking {

    private BookSearchRanking() {}

    private static final int STARTS_WITH_QUERY = 120;
    private static final int TITLE_HAS_QUERY = 70;
    private static final int TITLE_HAS_TOKEN = 26;
    private static final int AUTHOR_HAS_TOKEN = 18;
    private static final int HAS_PAGE_COUNT = 8;
    private static final int HAS_COVER = 4;

    static List<GoogleBooksResponse.Item> byRelevance(List<GoogleBooksResponse.Item> items, String query) {
        String normalizedQuery = normalize(query);
        String[] tokens = normalizedQuery.split("\\s+");

        // sorted() é estável: com a mesma pontuação, a ordem da fonte é preservada
        return items.stream()
                .sorted(Comparator.comparingInt((GoogleBooksResponse.Item item) ->
                        score(item, normalizedQuery, tokens)).reversed())
                .toList();
    }

    private static int score(GoogleBooksResponse.Item item, String query, String[] tokens) {
        var info = item.volumeInfo();
        if (info == null) {
            return Integer.MIN_VALUE;
        }

        String title = normalize(info.title());
        String authors = info.authors() == null ? "" : normalize(String.join(" ", info.authors()));

        int score = 0;
        if (title.startsWith(query)) {
            score += STARTS_WITH_QUERY;
        } else if (title.contains(query)) {
            score += TITLE_HAS_QUERY;
        }

        for (String token : tokens) {
            if (token.isBlank()) {
                continue;
            }
            if (title.contains(token)) {
                score += TITLE_HAS_TOKEN;
            }
            if (authors.contains(token)) {
                score += AUTHOR_HAS_TOKEN;
            }
        }

        if (info.pageCount() != null && info.pageCount() > 0) {
            score += HAS_PAGE_COUNT;
        }
        if (info.imageLinks() != null && info.imageLinks().thumbnail() != null) {
            score += HAS_COVER;
        }
        return score;
    }

    /** Minúsculo e sem acento: "Sertões" e "sertoes" precisam casar. */
    private static String normalize(String text) {
        if (text == null) {
            return "";
        }
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }
}
