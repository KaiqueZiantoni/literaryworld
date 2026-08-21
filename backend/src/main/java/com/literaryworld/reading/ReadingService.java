package com.literaryworld.reading;

import com.literaryworld.catalog.BookRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ReadingService {

    private final UserBookRepository userBookRepository;
    private final ReadingLogRepository readingLogRepository;
    private final BookRepository bookRepository;

    public ReadingService(UserBookRepository userBookRepository,
                          ReadingLogRepository readingLogRepository,
                          BookRepository bookRepository) {
        this.userBookRepository = userBookRepository;
        this.readingLogRepository = readingLogRepository;
        this.bookRepository = bookRepository;
    }

    @Transactional
    public Optional<UserBook> addToShelf(UUID userId, UUID bookId, ReadingStatus status) {
        if (bookRepository.findById(bookId).isEmpty()) {
            return Optional.empty();
        }

        var existing = userBookRepository.findByUserIdAndBookId(userId, bookId);
        if (existing.isPresent()) {
            return existing;
        }

        var userBook = new UserBook(UUID.randomUUID(), userId, bookId, status);
        return Optional.of(userBookRepository.save(userBook));
    }

    @Transactional
    public Optional<UserBook> updateProgress(UUID userId, UUID userBookId, int page) {
        return userBookRepository.findByIdAndUserId(userBookId, userId)
                .map(userBook -> {
                    int effectivePage = page;

                    var book = bookRepository.findById(userBook.getBookId()).orElse(null);
                    Integer totalPages = book != null ? book.getPageCount() : null;

                    if (totalPages != null && effectivePage > totalPages) {
                        effectivePage = totalPages; // clamp: intenção clara de "terminei"
                    }

                    userBook.updateProgress(effectivePage);

                    if (totalPages != null && effectivePage == totalPages) {
                        userBook.finish(); // conclusão automática (lado 1 do híbrido)
                    }

                    var today = LocalDate.now();
                    int pageForLog = effectivePage;
                    readingLogRepository.findByUserBookIdAndLogDate(userBookId, today)
                            .ifPresentOrElse(
                                    log -> log.updatePage(pageForLog),
                                    () -> readingLogRepository.save(
                                            new ReadingLog(UUID.randomUUID(), userBookId, today, pageForLog))
                            );

                    return userBook;
                });
    }

    @Transactional
    public Optional<UserBook> finishReading(UUID userId, UUID userBookId) {
        return userBookRepository.findByIdAndUserId(userBookId, userId)
                .map(userBook -> {
                    userBook.finish(); // conclusão manual (lado 2 do híbrido)
                    return userBook;
                });
    }

    @Transactional(readOnly = true)
    public List<ShelfItemResponse> getShelf(UUID userId) {
        return userBookRepository.findShelfWithBooks(userId);
    }
}