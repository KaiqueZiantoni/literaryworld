package com.literaryworld.auth;

import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthController(AuthService authService,
                          JwtService jwtService,
                          RefreshTokenService refreshTokenService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        UUID userId = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of("id", userId, "username", request.username()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request) {
        UUID userId = authService.login(request);
        String accessToken = jwtService.generateToken(userId);
        String refreshToken = refreshTokenService.issueNewFamily(userId);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(refreshToken).toString())
                .body(Map.of("accessToken", accessToken));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(
            @CookieValue(value = "refresh_token", required = false) String refreshToken) {

        if (refreshToken == null) {
            throw new InvalidCredentialsException();
        }

        var issued = refreshTokenService.rotate(refreshToken);
        String accessToken = jwtService.generateToken(issued.userId());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(issued.rawToken()).toString())
                .body(Map.of("accessToken", accessToken));
    }

    private ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(false) // TODO: true em produção (exige HTTPS)
                .sameSite("Strict")
                .path("/auth/refresh")
                .maxAge(Duration.ofDays(30))
                .build();
    }
}