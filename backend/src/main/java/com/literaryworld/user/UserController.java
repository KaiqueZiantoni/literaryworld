package com.literaryworld.user;

import com.literaryworld.reading.UserBookRepository;
import com.literaryworld.reading.UserGenreStatsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final UserGenreStatsRepository statsRepository;
    private final UserBookRepository userBookRepository;

    public UserController(UserRepository userRepository,
                          UserGenreStatsRepository statsRepository,
                          UserBookRepository userBookRepository) {
        this.userRepository = userRepository;
        this.statsRepository = statsRepository;
        this.userBookRepository = userBookRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@RequestAttribute("userId") UUID userId) {
        return userRepository.findById(userId)
                .map(user -> new UserProfileResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getDisplayName(),
                        user.getBio(),
                        user.getCreatedAt()
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{username}/world")
    public ResponseEntity<?> world(@PathVariable String username) {
        return userRepository.findByUsername(username)
                .map(user -> ResponseEntity.ok((Object) new WorldResponse(
                        user.getUsername(),
                        user.getDisplayName(),
                        statsRepository.findGenreDensity(user.getId()),
                        userBookRepository.findWorldBooks(user.getId())
                )))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", 404, "error", "Not Found",
                                "message", "usuário não encontrado")));
    }
}