package com.literaryworld.auth.email;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.Set;
import java.util.regex.Pattern;

/**
 * Quatro camadas, da mais barata para a mais cara: sintaxe, domínio reservado,
 * caixa descartável e, por último, a pergunta ao DNS.
 */
public class RealEmailValidator implements ConstraintValidator<RealEmail, String> {

    /** Mais estrito que o @Email do Bean Validation: exige TLD alfabético de 2+ letras. */
    private static final Pattern SYNTAX = Pattern.compile(
            "^[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*" +
            "@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z]{2,63}$");

    /** Domínios e TLDs que os RFCs 2606/6761 reservam para exemplo e teste. */
    private static final Set<String> RESERVED_DOMAINS = Set.of(
            "example.com", "example.net", "example.org", "example.edu",
            "localhost", "localhost.localdomain");
    private static final Set<String> RESERVED_TLDS = Set.of(
            "test", "invalid", "example", "localhost", "local", "internal");

    private static final int MAX_LENGTH = 254;
    private static final int MAX_LOCAL_LENGTH = 64;

    private final EmailPolicyProperties policy;
    private final DisposableDomains disposableDomains;
    private final MailDomainResolver mailDomainResolver;

    public RealEmailValidator(EmailPolicyProperties policy,
                              DisposableDomains disposableDomains,
                              MailDomainResolver mailDomainResolver) {
        this.policy = policy;
        this.disposableDomains = disposableDomains;
        this.mailDomainResolver = mailDomainResolver;
    }

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true; // ausência é problema do @NotBlank
        }

        String email = value.trim().toLowerCase();

        if (email.length() > MAX_LENGTH || !SYNTAX.matcher(email).matches()) {
            return reject(context, "e-mail inválido — confira o endereço");
        }

        int at = email.lastIndexOf('@');
        String local = email.substring(0, at);
        String domain = email.substring(at + 1);

        if (local.length() > MAX_LOCAL_LENGTH || local.contains("..") || domain.contains("..")) {
            return reject(context, "e-mail inválido — confira o endereço");
        }

        if (policy.isTrusted(domain)) {
            return true;
        }

        String tld = domain.substring(domain.lastIndexOf('.') + 1);
        if (RESERVED_DOMAINS.contains(domain) || RESERVED_TLDS.contains(tld)) {
            return reject(context, "use um e-mail real — este domínio é reservado para exemplos");
        }

        if (disposableDomains.contains(domain)) {
            return reject(context, "e-mails temporários não são aceitos — use seu endereço de verdade");
        }

        if (!mailDomainResolver.canReceiveMail(domain)) {
            return reject(context, "o domínio '" + domain + "' não recebe e-mails — confira a digitação");
        }

        return true;
    }

    private boolean reject(ConstraintValidatorContext context, String message) {
        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
        return false;
    }
}
