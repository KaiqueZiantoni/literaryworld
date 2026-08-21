CREATE TABLE books (
                       id              UUID PRIMARY KEY,
                       google_books_id VARCHAR(20) NOT NULL UNIQUE,
                       title           VARCHAR(500) NOT NULL,
                       authors         VARCHAR(500) NOT NULL,
                       page_count      INT,
                       language        VARCHAR(10),
                       cover_url       VARCHAR(500),
                       cached_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE genres (
                        id   SMALLINT PRIMARY KEY,
                        slug VARCHAR(30) NOT NULL UNIQUE,
                        name VARCHAR(50) NOT NULL
);

CREATE TABLE book_genres (
                             book_id  UUID NOT NULL REFERENCES books(id),
                             genre_id SMALLINT NOT NULL REFERENCES genres(id),
                             PRIMARY KEY (book_id, genre_id)
);

INSERT INTO genres (id, slug, name) VALUES
                                        (1,  'fantasia',        'Fantasia'),
                                        (2,  'ficcao-cientifica','Ficção Científica'),
                                        (3,  'romance',         'Romance'),
                                        (4,  'terror',          'Terror'),
                                        (5,  'suspense',        'Suspense'),
                                        (6,  'drama',           'Drama'),
                                        (7,  'aventura',        'Aventura'),
                                        (8,  'biografia',       'Biografia'),
                                        (9,  'historia',        'História'),
                                        (10, 'poesia',          'Poesia'),
                                        (11, 'autoajuda',       'Autoajuda'),
                                        (12, 'tecnico',         'Técnico'),
                                        (13, 'classico',        'Clássico'),
                                        (14, 'infantojuvenil',  'Infantojuvenil'),
                                        (15, 'quadrinhos',      'Quadrinhos');