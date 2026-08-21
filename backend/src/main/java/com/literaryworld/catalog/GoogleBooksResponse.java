package com.literaryworld.catalog;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record GoogleBooksResponse(List<Item> items) {

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Item(String id, VolumeInfo volumeInfo) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record VolumeInfo(
            String title,
            List<String> authors,
            Integer pageCount,
            List<String> categories,
            String language,
            ImageLinks imageLinks
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ImageLinks(String thumbnail) {}
}