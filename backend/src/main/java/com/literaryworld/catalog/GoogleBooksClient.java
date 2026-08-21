package com.literaryworld.catalog;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

@Component
public class GoogleBooksClient {

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
                            .queryParam("maxResults", 20)
                            .queryParam("langRestrict", "pt")
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(GoogleBooksResponse.class);

            if (response == null || response.items() == null) {
                return Optional.of(List.of());
            }
            return Optional.of(response.items());

        } catch (RestClientException e) {
            return Optional.empty();
        }
    }
}