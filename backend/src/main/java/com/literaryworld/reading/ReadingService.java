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

    /** Resultado de adicionar à estante: o item e se ele já morava lá. */
    public record ShelfAddition(ShelfItemResponse item, boolean alreadyOnShelf) {}

    @Transactional
    public Optional<ShelfAddition> addToShelf(UUID userId, UUID bookId, ReadingStatus status) {
        if (bookRepository.findById(bookId).isEmpty()) {
            return Optional.empty();
        }

        var existing = userBookRepository.findByUserIdAndBookId(userId, bookId);
        if (existing.isPresent()) {
            return describe(userId, existing.get().getId()).map(item -> new ShelfAddition(item, true));
        }

        var userBook = userBookRepository.save(new UserBook(UUID.randomUUID(), userId, bookId, status));
        return describe(userId, userBook.getId()).map(item -> new ShelfAddition(item, false));
    }

    @Transactional
    public Optional<ShelfItemResponse> updateProgress(UUID userId, UUID userBookId, int page) {
        return userBookRepository.findByIdAndUserId(userBookId, userId)
                .flatMap(userBook -> {
                    var book = bookRepository.findById(userBook.getBookId()).orElse(null);
                    Integer totalPages = book != null ? book.getPageCount() : null;

                    int effectivePage = totalPages != null && page > totalPages ? totalPages : page;

                    userBook.updateProgress(effectivePage);

                    if (totalPages != null && effectivePage == totalPages) {
                        finishAndUpdateStats(userBook);
                    }

                    recordDailyLog(userBookId, effectivePage);

                    return describe(userId, userBookId);
                });
    }

    @Transactional
    public Optional<ShelfItemResponse> finishReading(UUID userId, UUID userBookId) {
        return userBookRepository.findByIdAndUserId(userBookId, userId)
                .flatMap(userBook -> {
                    finishAndUpdateStats(userBook);
                    return describe(userId, userBookId);
                });
    }

    @Transactional
    public Optional<ShelfItemResponse> reopenReading(UUID userId, UUID userBookId) {
        return userBookRepository.findByIdAndUserId(userBookId, userId)
                .flatMap(userBook -> {
                    if (userBook.getStatus() != ReadingStatus.LIDO) {
                        return describe(userId, userBookId); // só se reabre o que está concluído
                    }

                    var book = bookRepository.findById(userBook.getBookId()).orElse(null);
                    if (book != null) {
                        int pages = book.getPageCount() != null ? book.getPageCount() : 0;
                        book.getGenres().forEach(genre ->
                                statsRepository.findById(new UserGenreStatsId(userBook.getUserId(), genre.getId()))
                                        .ifPresent(stats -> stats.unregisterFinishedBook(pages)));
                    }

                    userBook.reopen();
                    return describe(userId, userBookId);
                });
    }

    @Transactional(readOnly = true)
    public List<ShelfItemResponse> getShelf(UUID userId) {
        return userBookRepository.findShelfWithBooks(userId);
    }

    @Transactional
    public boolean removeFromShelf(UUID userId, UUID userBookId) {
        return userBookRepository.findByIdAndUserId(userBookId, userId)
                .map(userBook -> {
                    if (userBook.getStatus() == ReadingStatus.LIDO) {
                        var book = bookRepository.findById(userBook.getBookId()).orElse(null);
                        if (book != null) {
                            int pages = book.getPageCount() != null ? book.getPageCount() : 0;
                            book.getGenres().forEach(genre ->
                                    statsRepository.findById(new UserGenreStatsId(userId, genre.getId()))
                                            .ifPresent(stats -> stats.unregisterFinishedBook(pages)));
                        }
                    }

                    readingLogRepository.deleteAllByUserBookId(userBookId);
                    userBookRepository.delete(userBook);
                    return true;
                })
                .orElse(false);
    }

    /**
     * Relê o item pela projeção da estante para que a resposta chegue ao cliente já
     * com título, capa, gênero e o status recalculado — ele aplica o resultado sem
     * pedir a estante inteira de novo.
     */
    private Optional<ShelfItemResponse> describe(UUID userId, UUID userBookId) {
        return userBookRepository.findShelfItem(userBookId, userId);
    }

    private void recordDailyLog(UUID userBookId, int page) {
        var today = LocalDate.now();
        readingLogRepository.findByUserBookIdAndLogDate(userBookId, today)
                .ifPresentOrElse(
                        log -> log.updatePage(page),
                        () -> readingLogRepository.save(new ReadingLog(UUID.randomUUID(), userBookId, today, page))
                );
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
