CREATE TABLE reviews (
                         id         UUID PRIMARY KEY,
                         user_id    UUID NOT NULL REFERENCES users(id),
                         book_id    UUID NOT NULL REFERENCES books(id),
                         rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                         body       VARCHAR(1000) NOT NULL,
                         is_spoiler BOOLEAN NOT NULL DEFAULT false,
                         created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                         updated_at TIMESTAMPTZ,
                         UNIQUE (user_id, book_id)
);

CREATE INDEX idx_reviews_book ON reviews(book_id);