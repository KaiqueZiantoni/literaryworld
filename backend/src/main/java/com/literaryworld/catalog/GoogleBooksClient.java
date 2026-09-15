package com.literaryworld.catalog;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Component
public class GoogleBooksClient {

    private static final Logger log = LoggerFactory.getLogger(GoogleBooksClient.class);

    private final RestClient restClient;
    private final String apiKey;

    public GoogleBooksClient(RestClient.Builder builder,
                             @Value("${google-books.api-key}") String apiKey) {
        this.restClient = builder
                .baseUrl("https://www.googleapis.com/books/v1")
                .build();
        this.apiKey = apiKey;
    }

    public Optional<List<GoogleBooksResponse.Item>> search(String query) {
        try {
            var response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/volumes")
                            .queryParam("q", query)
                            .queryParam("maxResults", 24)
                            // printType=books tira revista e anuário do resultado.
                            // langRestrict foi removido de propósito: além de não
                            // melhorar a relevância, ele escondia a edição original
                            // de quem busca pelo título em inglês.
                            .queryParam("printType", "books")
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(GoogleBooksResponse.class);

            if (response == null || response.items() == null) {
                return Optional.of(List.of());
            }
            return Optional.of(response.items());

        } catch (RestClientException e) {
            log.warn("Busca na Google Books falhou para '{}': {}", query, e.getMessage());
            return Optional.empty();
        }
    }

    public Optional<GoogleBooksResponse.Item> findById(String googleBooksId) {
        try {
            var item = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/volumes/{id}")
                            .queryParam("key", apiKey)
                            .build(googleBooksId))
                    .retrieve()
                    .body(GoogleBooksResponse.Item.class);
            return Optional.ofNullable(item);
        } catch (RestClientException e) {
            return Optional.empty();
        }
    }
}