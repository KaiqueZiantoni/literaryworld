package com.literaryworld.catalog;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CatalogService {

    private final BookRepository bookRepository;

    public CatalogService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @Transactional
    public Book addBook(String googleBooksId, String title, String authors,
                        Integer pageCount, String language, String coverUrl, UUID addedBy) {

        return bookRepository.findByGoogleBooksId(googleBooksId)
                .orElseGet(() -> bookRepository.save(new Book(
                        UUID.randomUUID(),
                        googleBooksId,
                        title,
                        authors,
                        pageCount != null && pageCount > 0 ? pageCount : null,
                        language,
                        coverUrl != null && !coverUrl.isBlank() ? coverUrl : null,
                        addedBy
                )));
    }
}