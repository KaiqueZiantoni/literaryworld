package com.literaryworld.shared.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.List;

/**
 * O que muda entre a maquina de desenvolvimento e a internet.
 *
 * <p><b>O cookie.</b> Em desenvolvimento, front e back moram em localhost e
 * {@code SameSite=Strict} e a escolha mais apertada possivel. Publicados em
 * dominios diferentes (vercel.app e onrender.com, por exemplo), eles viram
 * <i>sites</i> distintos para o navegador, que passa a nao enviar um cookie
 * Strict em requisicao alguma — o refresh falharia em silencio e a sessao
 * morreria a cada quinze minutos. Em producao a dupla obrigatoria e
 * {@code SameSite=None} com {@code Secure=true}, que so funciona sobre HTTPS.
 *
 * <p><b>As origens.</b> Com {@code allowCredentials}, o CORS proibe o curinga
 * "*": cada origem precisa ser declarada. Os padroes aceitam o subdominio
 * aleatorio que a Vercel gera para cada preview.
 */
@ConfigurationProperties(prefix = "literaryworld.web")
public record WebSecurityProperties(
        @DefaultValue("http://localhost:5173,http://127.0.0.1:5173") List<String> allowedOrigins,
        @DefaultValue("false") boolean cookieSecure,
        @DefaultValue("Strict") String cookieSameSite
) {
    public WebSecurityProperties {
        allowedOrigins = allowedOrigins == null
                ? List.of()
                : allowedOrigins.stream().map(String::trim).filter(origem -> !origem.isBlank()).toList();
    }
}
