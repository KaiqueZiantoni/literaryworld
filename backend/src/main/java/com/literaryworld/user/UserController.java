package com.literaryworld.user;

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
    private final WorldService worldService;

    public UserController(UserRepository userRepository, WorldService worldService) {
        this.userRepository = userRepository;
        this.worldService = worldService;
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
        return worldService.forUsername(username)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", 404, "error", "Not Found",
                                "message", "usuário não encontrado")));
    }
}
