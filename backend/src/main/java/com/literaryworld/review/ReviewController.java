package com.literaryworld.review;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/books/{bookId}/review")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    public record ReviewRequest(
            @NotNull(message = "rating é obrigatório")
            @Min(value = 1, message = "rating mínimo é 1")
            @Max(value = 5, message = "rating máximo é 5")
            Short rating,

            @NotBlank(message = "body é obrigatório")
            @Size(max = 1000, message = "review deve ter no máximo 1000 caracteres")
            String body,

            boolean spoiler
    ) {}

    @PutMapping
    public ResponseEntity<?> upsertReview(@PathVariable UUID bookId,
                                          @Valid @RequestBody ReviewRequest request,
                                          @RequestAttribute("userId") UUID userId) {

        return reviewService.upsertReview(userId, bookId, request.rating(),
                        request.body().trim(), request.spoiler())
                .map(review -> ResponseEntity.ok((Object) Map.of(
                        "id", review.getId(),
                        "bookId", review.getBookId(),
                        "rating", review.getRating(),
                        "body", review.getBody(),
                        "spoiler", review.isSpoiler(),
                        "createdAt", review.getCreatedAt().toString(),
                        "updatedAt", review.getUpdatedAt() != null ? review.getUpdatedAt().toString() : ""
                )))
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("status", 403, "error", "Forbidden",
                                "message", "adicione o livro à sua estante antes de resenhar")));
    }
    @GetMapping
    public ResponseEntity<List<ReviewWithCredibility>> getReviews(@PathVariable UUID bookId) {
        return ResponseEntity.ok(reviewService.getBookReviews(bookId));
    }
}