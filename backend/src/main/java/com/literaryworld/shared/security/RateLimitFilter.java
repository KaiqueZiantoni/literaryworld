package com.literaryworld.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Teto de requisições por origem nas rotas públicas e caras.
 *
 * <p><b>O que ele protege.</b> O cadastro custa uma consulta de DNS mais um hash
 * Argon2id, que é caro de propósito; sem teto, um laço de shell consome a CPU do
 * contêiner inteiro. O login já tem lockout por conta, e o que falta ali é o
 * limite por origem, contra quem varre muitas contas em vez de insistir numa só.
 * A busca gasta cota da chave da Google Books, que é um recurso compartilhado
 * por todos os leitores.
 *
 * <p><b>Janela fixa, e não deslizante.</b> A janela fixa deixa passar até o dobro
 * do limite na virada de dois períodos. Ela fica porque custa um contador por
 * origem, enquanto a deslizante guardaria o horário de cada requisição — e o
 * contêiner gratuito tem 512 MB. Para barrar automação o resultado é o mesmo.
 *
 * <p><b>Memória, e não banco.</b> Com uma instância só, o contador na memória é
 * suficiente e não paga ida ao banco em toda requisição. Ao escalar para duas
 * instâncias, cada uma passa a contar metade — a hora de trocar por Redis.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);

    /** Teto por origem em cada rota vigiada. */
    private record Rule(String method, String path, int maxRequests, Duration window) {
        boolean matches(HttpServletRequest request) {
            return method.equals(request.getMethod()) && request.getRequestURI().startsWith(path);
        }
    }

    private static final List<Rule> RULES = List.of(
            // Cadastro: consulta de DNS + Argon2id. Cinco por hora já é folgado
            // para gente de verdade e inviabiliza criação em massa.
            new Rule("POST", "/auth/register", 5, Duration.ofHours(1)),
            // Login: o lockout por conta cuida de quem insiste numa conta só;
            // este teto pega quem varre muitas.
            new Rule("POST", "/auth/login", 15, Duration.ofMinutes(5)),
            // Refresh é legítimo com frequência: o cliente rotaciona a cada 15 min
            // e várias abas rotacionam juntas.
            new Rule("POST", "/auth/refresh", 60, Duration.ofMinutes(5)),
            // Busca: protege a cota da chave da Google Books.
            new Rule("GET", "/catalog/search", 40, Duration.ofMinutes(5))
    );

    private static final int MAX_TRACKED = 10_000;

    /** Contador de uma origem dentro de uma janela. */
    private static final class Window {
        private final AtomicInteger hits = new AtomicInteger();
        private volatile long startedAt;

        Window(long agora) {
            this.startedAt = agora;
        }
    }

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        // O preflight não carrega credencial e não executa nada: contá-lo
        // gastaria o teto do usuário com o protocolo do navegador.
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        Rule rule = RULES.stream().filter(candidata -> candidata.matches(request)).findFirst().orElse(null);
        if (rule == null) {
            chain.doFilter(request, response);
            return;
        }

        String client = clientOf(request);
        long agora = System.currentTimeMillis();
        long janelaMs = rule.window().toMillis();
        String chave = rule.path() + '|' + client;

        Window window = windows.compute(chave, (ignorada, atual) -> {
            if (atual == null || agora - atual.startedAt >= janelaMs) {
                var nova = new Window(agora);
                nova.hits.set(1);
                return nova;
            }
            atual.hits.incrementAndGet();
            return atual;
        });

        if (window.hits.get() > rule.maxRequests()) {
            long esperaSegundos = Math.max(1, (janelaMs - (agora - window.startedAt)) / 1000);
            log.warn("Teto atingido em {} por {} — {} requisições na janela",
                    rule.path(), client, window.hits.get());
            reject(response, esperaSegundos);
            return;
        }

        limpaSeNecessario(agora);
        chain.doFilter(request, response);
    }

    /**
     * Atrás do proxy do Render, o IP real vem no X-Forwarded-For; o primeiro da
     * lista é o cliente. O cabeçalho é forjável por quem fala direto com a
     * aplicação, então ele só vale porque a plataforma reescreve o valor na
     * borda. Rodando sem proxy à frente, use o IP da conexão.
     */
    private String clientOf(HttpServletRequest request) {
        String encaminhado = request.getHeader("X-Forwarded-For");
        if (encaminhado != null && !encaminhado.isBlank()) {
            int virgula = encaminhado.indexOf(',');
            String primeiro = (virgula > 0 ? encaminhado.substring(0, virgula) : encaminhado).trim();
            if (!primeiro.isBlank()) {
                return primeiro;
            }
        }
        return request.getRemoteAddr();
    }

    /** Sem isto o mapa cresceria com cada origem que já passou por aqui. */
    private void limpaSeNecessario(long agora) {
        if (windows.size() < MAX_TRACKED) {
            return;
        }
        long maiorJanela = RULES.stream().mapToLong(regra -> regra.window().toMillis()).max().orElse(0);
        windows.values().removeIf(janela -> agora - janela.startedAt >= maiorJanela);
        if (windows.size() >= MAX_TRACKED) {
            windows.clear(); // pressão anormal: zera em vez de crescer sem teto
        }
    }

    private void reject(HttpServletResponse response, long esperaSegundos) throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", String.valueOf(esperaSegundos));
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(
                "{\"status\":429,\"error\":\"Too Many Requests\"," +
                "\"message\":\"muitas tentativas — aguarde " + esperaSegundos + " segundos\"}");
    }
}
