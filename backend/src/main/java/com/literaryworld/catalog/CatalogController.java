package com.literaryworld.catalog;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

    private final GoogleBooksClient googleBooksClient;

    public CatalogController(GoogleBooksClient googleBooksClient) {
        this.googleBooksClient = googleBooksClient;
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        if (q == null || q.isBlank() || q.length() > 100) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", 400, "error", "Bad Request",
                            "message", "parâmetro de busca inválido"));
        }

        return googleBooksClient.search(q.trim())
                .map(items -> ResponseEntity.ok((Object) Map.of("results", toResults(items))))
                .orElse(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("status", 503, "error", "Service Unavailable",
                                "message", "busca temporariamente indisponível")));
    }

    private List<Map<String, Object>> toResults(List<GoogleBooksResponse.Item> items) {
        return items.stream()
                .filter(item -> item.volumeInfo() != null && item.volumeInfo().title() != null)
                .map(item -> {
                    var info = item.volumeInfo();
                    return Map.<String, Object>of(
                            "googleBooksId", item.id(),
                            "title", info.title(),
                            "authors", info.authors() != null ? String.join(", ", info.authors()) : "Autor desconhecido",
                            "pageCount", info.pageCount() != null && info.pageCount() > 0 ? info.pageCount() : 0,
                            "coverUrl", info.imageLinks() != null && info.imageLinks().thumbnail() != null
                                    ? info.imageLinks().thumbnail() : ""
                    );
                })
                .toList();
    }
}