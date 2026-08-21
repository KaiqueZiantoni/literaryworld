CREATE TABLE refresh_tokens (
                                id           UUID PRIMARY KEY,
                                user_id      UUID NOT NULL REFERENCES users(id),
                                token_hash   VARCHAR(64) NOT NULL UNIQUE,
                                family_id    UUID NOT NULL,
                                issued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
                                expires_at   TIMESTAMPTZ NOT NULL,
                                revoked_at   TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family_id);