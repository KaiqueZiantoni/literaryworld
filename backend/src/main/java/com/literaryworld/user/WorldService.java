package com.literaryworld.user;

import com.literaryworld.reading.UserBookRepository;
import com.literaryworld.reading.UserGenreStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Monta o Mundo Visual — a vitrine pública de um leitor.
 *
 * Existe para tirar do controller o cruzamento de três módulos (perfil, placar de
 * gêneros e estante) e, principalmente, para resolver aqui a costura que o mapa
 * precisa: o placar conta um livro em CADA gênero que ele tem, então o livro
 * também precisa chegar ao cliente com todos os seus gêneros. Sem isso uma região
 * anuncia três histórias vividas e desenha só uma.
 */
@Service
public class WorldService {

    private final UserRepository userRepository;
    private final UserGenreStatsRepository statsRepository;
    private final UserBookRepository userBookRepository;

    public WorldService(UserRepository userRepository,
                        UserGenreStatsRepository statsRepository,
                        UserBookRepository userBookRepository) {
        this.userRepository = userRepository;
        this.statsRepository = statsRepository;
        this.userBookRepository = userBookRepository;
    }

    @Transactional(readOnly = true)
    public Optional<WorldResponse> forUsername(String username) {
        return userRepository.findByUsername(username).map(user -> {
            var genresByBook = groupGenresByBook(userBookRepository.findBookGenres(user.getId()));

            var books = userBookRepository.findWorldBooks(user.getId()).stream()
                    .map(book -> book.withGenres(genresByBook.get(book.bookId())))
                    .toList();

            return new WorldResponse(
                    user.getUsername(),
                    user.getDisplayName(),
                    statsRepository.findGenreDensity(user.getId()),
                    books
            );
        });
    }

    private Map<UUID, List<String>> groupGenresByBook(List<WorldResponse.BookGenre> pairs) {
        var grouped = new LinkedHashMap<UUID, List<String>>();
        for (var pair : pairs) {
            grouped.computeIfAbsent(pair.bookId(), key -> new java.util.ArrayList<>()).add(pair.slug());
        }
        return grouped;
    }
}
