CREATE TABLE user_genre_stats (
                                  user_id        UUID NOT NULL REFERENCES users(id),
                                  genre_id       SMALLINT NOT NULL REFERENCES genres(id),
                                  books_finished INT NOT NULL DEFAULT 0,
                                  pages_read     INT NOT NULL DEFAULT 0,
                                  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
                                  PRIMARY KEY (user_id, genre_id)
);