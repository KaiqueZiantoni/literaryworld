package com.literaryworld.shared.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.List;

@Configuration
public class CorsConfig {

    private final WebSecurityProperties properties;

    public CorsConfig(WebSecurityProperties properties) {
        this.properties = properties;
    }

    @Bean
    public CorsFilter corsFilter() {
        var config = new CorsConfiguration();
        // Padrao em vez de origem exata: a Vercel publica cada preview em um
        // subdominio novo, e "https://*.vercel.app" cobre todos eles.
        config.setAllowedOriginPatterns(properties.allowedOrigins());
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
