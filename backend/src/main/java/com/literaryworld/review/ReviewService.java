package com.literaryworld.review;

import com.literaryworld.reading.UserBookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserBookRepository userBookRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         UserBookRepository userBookRepository) {
        this.reviewRepository = reviewRepository;
        this.userBookRepository = userBookRepository;
    }

    @Transactional
    public Optional<Review> upsertReview(UUID userId, UUID bookId, short rating,
                                         String body, boolean spoiler) {

        // Regra de integridade social: só resenha quem tem o livro na estante
        if (userBookRepository.findByUserIdAndBookId(userId, bookId).isEmpty()) {
            return Optional.empty();
        }

        return Optional.of(
                reviewRepository.findByUserIdAndBookId(userId, bookId)
                        .map(existing -> {
                            existing.edit(rating, body, spoiler);
                            return existing;
                        })
                        .orElseGet(() -> reviewRepository.save(
                                new Review(UUID.randomUUID(), userId, bookId, rating, body, spoiler)))
        );
    }
    @Transactional(readOnly = true)
    public List<ReviewWithCredibility> getBookReviews(UUID bookId) {
        return reviewRepository.findByBookOrderedByCredibility(bookId);
    }
}