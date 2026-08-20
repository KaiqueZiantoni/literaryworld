package com.literaryworld.auth;

import com.literaryworld.user.User;
import com.literaryworld.user.UserRepository;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final UserCredentialsRepository credentialsRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       UserCredentialsRepository credentialsRepository) {
        this.userRepository = userRepository;
        this.credentialsRepository = credentialsRepository;
        this.passwordEncoder = Argon2PasswordEncoder.defaultsForSpringSecurity_v5_8();
    }

    @Transactional
    public UUID register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new IllegalArgumentException("username já está em uso");
        }
        if (credentialsRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("email já está em uso");
        }

        User user = new User(UUID.randomUUID(), request.username(), request.displayName());
        userRepository.saveAndFlush(user);

        String hash = passwordEncoder.encode(request.password());
        UserCredentials credentials = new UserCredentials(user, request.email(), hash);
        credentialsRepository.save(credentials);

        return user.getId();
    }

    @Transactional(readOnly = true)
    public UUID login(LoginRequest request) {
        var credentials = credentialsRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.password(), credentials.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return credentials.getUserId();
    }
}