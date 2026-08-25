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
    private final UserGenreStatsRepository statsRepository;

    public ReadingService(UserBookRepository userBookRepository,
                          ReadingLogRepository readingLogRepository,
                          BookRepository bookRepository,
                          UserGenreStatsRepository statsRepository) {
        this.userBookRepository = userBookRepository;
        this.readingLogRepository = readingLogRepository;
        this.bookRepository = bookRepository;
        this.statsRepository = statsRepository;
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
                        effectivePage = totalPages;
                    }

                    userBook.updateProgress(effectivePage);

                    if (totalPages != null && effectivePage == totalPages) {
                        finishAndUpdateStats(userBook);
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
                    finishAndUpdateStats(userBook);
                    return userBook;
                });
    }

    @Transactional
    public Optional<UserBook> reopenReading(UUID userId, UUID userBookId) {
        return userBookRepository.findByIdAndUserId(userBookId, userId)
                .map(userBook -> {
                    if (userBook.getStatus() != ReadingStatus.LIDO) {
                        return userBook; // só se reabre o que está concluído
                    }

                    var book = bookRepository.findById(userBook.getBookId()).orElse(null);
                    if (book != null) {
                        int pages = book.getPageCount() != null ? book.getPageCount() : 0;
                        book.getGenres().forEach(genre ->
                                statsRepository.findById(new UserGenreStatsId(userBook.getUserId(), genre.getId()))
                                        .ifPresent(stats -> stats.unregisterFinishedBook(pages)));
                    }

                    userBook.reopen();
                    return userBook;
                });
    }

    @Transactional(readOnly = true)
    public List<ShelfItemResponse> getShelf(UUID userId) {
        return userBookRepository.findShelfWithBooks(userId);
    }

    private void finishAndUpdateStats(UserBook userBook) {
        if (userBook.getStatus() == ReadingStatus.LIDO) {
            return; // já concluído: placar intocado (anti-inflação)
        }

        userBook.finish();

        var book = bookRepository.findById(userBook.getBookId()).orElse(null);
        if (book == null) {
            return;
        }

        int pages = book.getPageCount() != null ? book.getPageCount() : 0;

        book.getGenres().forEach(genre -> {
            var stats = statsRepository.findById(
                            new UserGenreStatsId(userBook.getUserId(), genre.getId()))
                    .orElseGet(() -> new UserGenreStats(userBook.getUserId(), genre.getId()));
            stats.registerFinishedBook(pages);
            statsRepository.save(stats);
        });
    }
}