package com.literaryworld.catalog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Service
public class CatalogService {

    private final BookRepository bookRepository;
    private final GenreRepository genreRepository;

    public CatalogService(BookRepository bookRepository, GenreRepository genreRepository) {
        this.bookRepository = bookRepository;
        this.genreRepository = genreRepository;
    }

    @Transactional
    public Book addBook(String googleBooksId, String title, String authors,
                        Integer pageCount, String language, String coverUrl,
                        UUID addedBy, Set<Short> genreIds) {

        return bookRepository.findByGoogleBooksId(googleBooksId)
                .orElseGet(() -> {
                    var book = new Book(
                            UUID.randomUUID(),
                            googleBooksId,
                            title,
                            authors,
                            pageCount != null && pageCount > 0 ? pageCount : null,
                            language,
                            coverUrl != null && !coverUrl.isBlank() ? coverUrl : null,
                            addedBy
                    );
                    book.assignGenres(new HashSet<>(genreRepository.findAllById(genreIds)));
                    return bookRepository.save(book);
                });
    }
}