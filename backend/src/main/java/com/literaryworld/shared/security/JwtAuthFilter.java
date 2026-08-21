package com.literaryworld.shared.security;

import com.literaryworld.auth.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/health",
            "/auth/register",
            "/auth/login",
            "/auth/refresh"
    );

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();

        if (PUBLIC_PATHS.contains(path) || isPublicWorldPath(path)) {
            chain.doFilter(request, response);
            return;
        }

        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            reject(response);
            return;
        }

        String token = header.substring(7);
        var userId = jwtService.validateAndGetUserId(token);
        if (userId.isEmpty()) {
            reject(response);
            return;
        }

        request.setAttribute("userId", userId.get());
        chain.doFilter(request, response);
    }

    private boolean isPublicWorldPath(String path) {
        // GET /users/{username}/world — a vitrine pública do Mundo Visual
        return path.startsWith("/users/") && path.endsWith("/world");
    }

    private void reject(HttpServletResponse response) throws IOException {
        response.setStatus(401);
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"token ausente ou inválido\"}");
    }
}