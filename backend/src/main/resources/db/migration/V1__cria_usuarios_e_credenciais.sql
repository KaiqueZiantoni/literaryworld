-- Extensão para e-mails/usernames case-insensitive
CREATE EXTENSION IF NOT EXISTS citext;

-- Perfil público: NUNCA contém segredos
CREATE TABLE users (
                       id           UUID PRIMARY KEY,
                       username     CITEXT NOT NULL UNIQUE,
                       display_name VARCHAR(60) NOT NULL,
                       bio          VARCHAR(300),
                       created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
                       deleted_at   TIMESTAMPTZ
);

-- Credenciais: isoladas do perfil por design
CREATE TABLE user_credentials (
                                  user_id           UUID PRIMARY KEY REFERENCES users(id),
                                  email             CITEXT NOT NULL UNIQUE,
                                  password_hash     VARCHAR(255) NOT NULL,
                                  email_verified_at TIMESTAMPTZ,
                                  failed_attempts   INT NOT NULL DEFAULT 0,
                                  locked_until      TIMESTAMPTZ,
                                  password_updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);