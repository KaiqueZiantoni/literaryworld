package com.literaryworld.catalog;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "genres")
public class Genre {

    @Id
    private Short id;

    @Column(nullable = false, unique = true, length = 30)
    private String slug;

    @Column(nullable = false, length = 50)
    private String name;

    protected Genre() {
        // Exigido pelo JPA
    }

    public Short getId() { return id; }
    public String getSlug() { return slug; }
    public String getName() { return name; }
}