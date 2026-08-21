package com.literaryworld.catalog;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

    private final GoogleBooksClient googleBooksClient;
    private final CatalogService catalogService;
    private final GenreRepository genreRepository;

    public CatalogController(GoogleBooksClient googleBooksClient,
                             CatalogService catalogService,
                             GenreRepository genreRepository) {
        this.googleBooksClient = googleBooksClient;
        this.catalogService = catalogService;
        this.genreRepository = genreRepository;
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

    public record AddBookRequest(
            @NotBlank(message = "googleBooksId é obrigatório")
            @Size(max = 20)
            @Pattern(regexp = "^[a-zA-Z0-9_-]+$", message = "googleBooksId inválido")
            String googleBooksId,

            @NotBlank(message = "title é obrigatório")
            @Size(max = 500)
            String title,

            @NotBlank(message = "authors é obrigatório")
            @Size(max = 500)
            String authors,

            @Min(value = 1, message = "pageCount deve ser positivo")
            @Max(value = 20000, message = "pageCount fora da faixa")
            Integer pageCount,

            @Size(max = 10)
            String language,

            @Size(max = 500)
            @Pattern(regexp = "^https?://.*", message = "coverUrl deve ser uma URL http(s)")
            String coverUrl,

            @NotEmpty(message = "genreIds é obrigatório")
            @Size(max = 5, message = "máximo de 5 gêneros por livro")
            Set<Short> genreIds
    ) {}

    @PostMapping("/books")
    public ResponseEntity<?> addBook(@Valid @RequestBody AddBookRequest request,
                                     @RequestAttribute("userId") UUID userId) {

        // A SOLUÇÃO DO EXERCÍCIO: pedidos vs. encontrados
        var foundGenres = genreRepository.findAllById(request.genreIds());
        if (foundGenres.size() != request.genreIds().size()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("status", 400, "error", "Bad Request",
                            "message", "um ou mais genreIds não existem no catálogo"));
        }

        Book book = catalogService.addBook(
                request.googleBooksId(),
                request.title().trim(),
                request.authors().trim(),
                request.pageCount(),
                request.language(),
                request.coverUrl(),
                userId,
                request.genreIds()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", book.getId(),
                "googleBooksId", book.getGoogleBooksId(),
                "title", book.getTitle(),
                "authors", book.getAuthors(),
                "pageCount", book.getPageCount() != null ? book.getPageCount() : 0,
                "coverUrl", book.getCoverUrl() != null ? book.getCoverUrl() : ""
        ));
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