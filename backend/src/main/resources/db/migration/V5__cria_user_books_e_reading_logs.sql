CREATE TABLE user_books (
                            id           UUID PRIMARY KEY,
                            user_id      UUID NOT NULL REFERENCES users(id),
                            book_id      UUID NOT NULL REFERENCES books(id),
                            status       VARCHAR(20) NOT NULL,
                            current_page INT NOT NULL DEFAULT 0,
                            started_at   TIMESTAMPTZ,
                            finished_at  TIMESTAMPTZ,
                            created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                            UNIQUE (user_id, book_id)
);

CREATE INDEX idx_user_books_user ON user_books(user_id);

CREATE TABLE reading_logs (
                              id           UUID PRIMARY KEY,
                              user_book_id UUID NOT NULL REFERENCES user_books(id),
                              log_date     DATE NOT NULL,
                              current_page INT NOT NULL,
                              UNIQUE (user_book_id, log_date)
);

CREATE INDEX idx_reading_logs_user_book ON reading_logs(user_book_id);