package com.literaryworld.auth.email;

import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.naming.NameNotFoundException;
import javax.naming.NamingException;
import javax.naming.directory.Attributes;
import javax.naming.directory.InitialDirContext;
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Hashtable;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Pergunta ao DNS se um domínio consegue receber e-mail.
 *
 * <p><b>Por que há um resolvedor configurável.</b> O provedor de DNS do JDK lê o
 * {@code resolv.conf} do sistema, e basta um nameserver IPv6 link-local na lista
 * para ele devolver resposta vazia até para gmail.com — e levar mais de dez
 * segundos para admitir que um domínio não existe. Apontando para um resolvedor
 * explícito, a mesma consulta responde em dezenas de milissegundos e distingue
 * NXDOMAIN de falha de rede. Deixe {@code dns-servers} vazio para usar a
 * configuração do sistema; preencha quando ela não for confiável.
 *
 * <p><b>O que reprova.</b> Só o domínio que o DNS afirma não existir. Timeout e
 * erro de rede passam: instabilidade de rede não pode derrubar o cadastro do site.
 */
@Component
public class MailDomainResolver {

    private static final Logger log = LoggerFactory.getLogger(MailDomainResolver.class);
    private static final int CACHE_LIMIT = 2_000;

    /** O que o DNS respondeu, incluindo "não sei" — que é uma resposta diferente de "não". */
    private enum Verdict { DELIVERS, MISSING, UNKNOWN }

    /** O mesmo punhado de provedores responde por quase todo endereço que chega. */
    private final Map<String, Boolean> cache = new ConcurrentHashMap<>();
    private final ExecutorService lookups = Executors.newCachedThreadPool(runnable -> {
        var thread = new Thread(runnable, "dns-lookup");
        thread.setDaemon(true);
        return thread;
    });

    private final EmailPolicyProperties policy;

    public MailDomainResolver(EmailPolicyProperties policy) {
        this.policy = policy;
    }

    @PreDestroy
    void shutdown() {
        lookups.shutdownNow();
    }

    public boolean canReceiveMail(String domain) {
        if (!policy.dnsCheckEnabled()) {
            return true;
        }

        Boolean cached = cache.get(domain);
        if (cached != null) {
            return cached;
        }

        boolean resolved = lookupWithinBudget(domain);

        if (cache.size() >= CACHE_LIMIT) {
            cache.clear();
        }
        cache.put(domain, resolved);
        return resolved;
    }

    /** O DNS não segura a thread da requisição além do orçamento configurado. */
    private boolean lookupWithinBudget(String domain) {
        Future<Boolean> task = lookups.submit(() -> hasMailRoute(domain));
        try {
            return task.get(policy.dnsTimeoutMillis() * 3L, TimeUnit.MILLISECONDS);
        } catch (TimeoutException e) {
            task.cancel(true);
            log.warn("DNS estourou o tempo para '{}' — e-mail aceito sem a checagem", domain);
            return true;
        } catch (Exception e) {
            log.warn("Falha ao checar DNS de '{}': {} — e-mail aceito sem a checagem", domain, e.toString());
            return true;
        }
    }

    private boolean hasMailRoute(String domain) {
        Verdict mx = queryMx(domain);
        if (mx == Verdict.DELIVERS) return true;
        if (mx == Verdict.MISSING) return false;

        // Inconclusivo no MX: o RFC 5321 manda entregar no próprio endereço do
        // domínio quando não há MX, então o domínio resolver já basta.
        try {
            InetAddress.getByName(domain);
            return true;
        } catch (UnknownHostException e) {
            return false;
        }
    }

    private Verdict queryMx(String domain) {
        var environment = new Hashtable<String, String>();
        environment.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
        environment.put("com.sun.jndi.dns.timeout.initial", String.valueOf(policy.dnsTimeoutMillis()));
        environment.put("com.sun.jndi.dns.timeout.retries", "2");

        String providers = policy.dnsProviderUrl();
        if (!providers.isBlank()) {
            environment.put("java.naming.provider.url", providers);
        }

        InitialDirContext context = null;
        try {
            context = new InitialDirContext(environment);
            Attributes attributes = context.getAttributes(domain, new String[]{"MX"});
            var mx = attributes.get("MX");
            return mx != null && mx.size() > 0 ? Verdict.DELIVERS : Verdict.UNKNOWN;
        } catch (NameNotFoundException e) {
            return Verdict.MISSING; // o servidor afirmou: este domínio não existe
        } catch (NamingException e) {
            return Verdict.UNKNOWN; // rede, timeout, provedor mal configurado
        } finally {
            closeQuietly(context);
        }
    }

    private void closeQuietly(InitialDirContext context) {
        if (context == null) {
            return;
        }
        try {
            context.close();
        } catch (NamingException ignored) {
            // fechar contexto de DNS não tem consequência de negócio
        }
    }
}
