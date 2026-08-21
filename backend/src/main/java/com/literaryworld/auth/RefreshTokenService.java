package com.literaryworld.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final Duration expiration;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(RefreshTokenRepository repository,
                               @Value("${refresh-token.expiration-days}") long expirationDays) {
        this.repository = repository;
        this.expiration = Duration.ofDays(expirationDays);
    }

    public record IssuedToken(String rawToken, UUID userId) {}

    @Transactional
    public String issueNewFamily(UUID userId) {
        return issue(userId, UUID.randomUUID());
    }

    @Transactional(noRollbackFor = InvalidCredentialsException.class)
    public IssuedToken rotate(String rawToken) {
        var token = repository.findByTokenHash(sha256(rawToken))
                .orElseThrow(InvalidCredentialsException::new);

        if (token.isRevoked()) {
            // Token já usado reapareceu: roubo detectado. Mata a família inteira.
            // noRollbackFor garante que esta revogação SOBREVIVE à exceção lançada abaixo.
            repository.revokeFamily(token.getFamilyId(), Instant.now());
            throw new InvalidCredentialsException();
        }

        if (token.isExpired()) {
            throw new InvalidCredentialsException();
        }

        token.revoke();
        String newRawToken = issue(token.getUserId(), token.getFamilyId());
        return new IssuedToken(newRawToken, token.getUserId());
    }

    private String issue(UUID userId, UUID familyId) {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        var refreshToken = new RefreshToken(
                UUID.randomUUID(),
                userId,
                sha256(rawToken),
                familyId,
                Instant.now().plus(expiration)
        );
        repository.save(refreshToken);
        return rawToken;
    }

    private String sha256(String value) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }
    }
}