package com.literaryworld.auth.email;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

import java.util.List;

/**
 * Política de aceitação de e-mails no cadastro.
 *
 * <p>{@code trustedDomains} é uma porta de serviço para desenvolvimento: domínios
 * listados aqui pulam as checagens de domínio. Deve ficar vazia em produção —
 * configure por variável de ambiente, nunca no código.
 *
 * <p>{@code dnsServers} aponta a consulta de MX para resolvedores explícitos. Vazio
 * significa "use a configuração do sistema". Preencher tem um custo de privacidade:
 * o domínio de cada e-mail cadastrado passa a ser consultado nesses servidores.
 */
@ConfigurationProperties(prefix = "literaryworld.email")
public record EmailPolicyProperties(
        @DefaultValue List<String> trustedDomains,
        @DefaultValue List<String> dnsServers,
        @DefaultValue("true") boolean dnsCheckEnabled,
        @DefaultValue("1500") int dnsTimeoutMillis
) {
    public EmailPolicyProperties {
        trustedDomains = normalize(trustedDomains);
        dnsServers = normalize(dnsServers);
        if (dnsTimeoutMillis <= 0) {
            dnsTimeoutMillis = 1500;
        }
    }

    private static List<String> normalize(List<String> values) {
        return values == null
                ? List.of()
                : values.stream()
                        .map(value -> value.trim().toLowerCase())
                        .filter(value -> !value.isBlank())
                        .toList();
    }

    public boolean isTrusted(String domain) {
        return trustedDomains.contains(domain);
    }

    /** Formato que o provedor de DNS do JNDI espera: URLs separadas por espaço. */
    public String dnsProviderUrl() {
        return dnsServers.stream()
                .map(server -> server.startsWith("dns://") ? server : "dns://" + server)
                .reduce((a, b) -> a + " " + b)
                .orElse("");
    }
}
