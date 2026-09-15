package com.literaryworld.auth.email;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.Set;

/** Lista de domínios de caixa temporária, carregada uma vez na subida da aplicação. */
@Component
public class DisposableDomains {

    private static final Logger log = LoggerFactory.getLogger(DisposableDomains.class);
    private static final String LIST_PATH = "security/disposable-email-domains.txt";

    private final Set<String> domains;

    public DisposableDomains() {
        this.domains = load();
        log.info("Política de e-mail: {} domínios descartáveis carregados", domains.size());
    }

    public boolean contains(String domain) {
        if (domains.contains(domain)) {
            return true;
        }
        // subdomínios de um serviço descartável herdam a recusa (ex.: x.mailinator.com)
        int cut = domain.indexOf('.');
        while (cut > 0 && cut < domain.length() - 1) {
            String parent = domain.substring(cut + 1);
            if (domains.contains(parent)) {
                return true;
            }
            cut = domain.indexOf('.', cut + 1);
        }
        return false;
    }

    private Set<String> load() {
        var loaded = new HashSet<String>();
        try (var reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource(LIST_PATH).getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                String domain = line.trim().toLowerCase();
                if (!domain.isEmpty() && !domain.startsWith("#")) {
                    loaded.add(domain);
                }
            }
        } catch (IOException e) {
            log.error("Não foi possível ler {} — a checagem de descartáveis fica inativa", LIST_PATH, e);
        }
        return Set.copyOf(loaded);
    }
}
