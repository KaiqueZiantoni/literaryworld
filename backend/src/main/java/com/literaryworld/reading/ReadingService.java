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
                    userBook.updateProgress(page);

                    var today = LocalDate.now();
                    readingLogRepository.findByUserBookIdAndLogDate(userBookId, today)
                            .ifPresentOrElse(
                                    log -> log.updatePage(page),
                                    () -> readingLogRepository.save(
                                            new ReadingLog(UUID.randomUUID(), userBookId, today, page))
                            );

                    return userBook;
                });
    }

    @Transactional(readOnly = true)
    public List<UserBook> getShelf(UUID userId) {
        return userBookRepository.findAllByUserId(userId);
    }
}