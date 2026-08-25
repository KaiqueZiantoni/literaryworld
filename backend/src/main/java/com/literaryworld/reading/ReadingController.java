package com.literaryworld.reading;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/shelf")
public class ReadingController {

    private final ReadingService readingService;

    public ReadingController(ReadingService readingService) {
        this.readingService = readingService;
    }

    public record AddToShelfRequest(
            @NotNull(message = "bookId é obrigatório")
            UUID bookId,

            @NotNull(message = "status é obrigatório")
            ReadingStatus status
    ) {}

    public record ProgressRequest(
            @Min(value = 0, message = "página não pode ser negativa")
            @Max(value = 20000, message = "página fora da faixa")
            int page
    ) {}

    @PostMapping
    public ResponseEntity<?> addToShelf(@Valid @RequestBody AddToShelfRequest request,
                                        @RequestAttribute("userId") UUID userId) {
        return readingService.addToShelf(userId, request.bookId(), request.status())
                .map(userBook -> ResponseEntity.status(HttpStatus.CREATED).body((Object) toResponse(userBook)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", 404, "error", "Not Found",
                                "message", "livro não encontrado no acervo")));
    }

    @PatchMapping("/{userBookId}/progress")
    public ResponseEntity<?> updateProgress(@PathVariable UUID userBookId,
                                            @Valid @RequestBody ProgressRequest request,
                                            @RequestAttribute("userId") UUID userId) {
        return readingService.updateProgress(userId, userBookId, request.page())
                .map(userBook -> ResponseEntity.ok((Object) toResponse(userBook)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", 404, "error", "Not Found",
                                "message", "leitura não encontrada")));
    }

    @GetMapping
    public ResponseEntity<List<ShelfItemResponse>> shelf(@RequestAttribute("userId") UUID userId) {
        return ResponseEntity.ok(readingService.getShelf(userId));
    }

    private Map<String, Object> toResponse(UserBook userBook) {
        return Map.of(
                "id", userBook.getId(),
                "bookId", userBook.getBookId(),
                "status", userBook.getStatus().name(),
                "currentPage", userBook.getCurrentPage(),
                "startedAt", userBook.getStartedAt() != null ? userBook.getStartedAt().toString() : "",
                "finishedAt", userBook.getFinishedAt() != null ? userBook.getFinishedAt().toString() : ""
        );
    }
    @PostMapping("/{userBookId}/finish")
    public ResponseEntity<?> finishReading(@PathVariable UUID userBookId,
                                           @RequestAttribute("userId") UUID userId) {
        return readingService.finishReading(userId, userBookId)
                .map(userBook -> ResponseEntity.ok((Object) toResponse(userBook)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", 404, "error", "Not Found",
                                "message", "leitura não encontrada")));
    }
    @PostMapping("/{userBookId}/reopen")
    public ResponseEntity<?> reopenReading(@PathVariable UUID userBookId,
                                           @RequestAttribute("userId") UUID userId) {
        return readingService.reopenReading(userId, userBookId)
                .map(userBook -> ResponseEntity.ok((Object) toResponse(userBook)))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", 404, "error", "Not Found",
                                "message", "leitura não encontrada")));
    }
}