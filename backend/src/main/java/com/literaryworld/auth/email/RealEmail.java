package com.literaryworld.auth.email;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.ANNOTATION_TYPE;
import static java.lang.annotation.ElementType.FIELD;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.PARAMETER;
import static java.lang.annotation.ElementType.RECORD_COMPONENT;

/**
 * Exige um endereço que possa existir de fato: sintaxe estrita, domínio fora da
 * lista de descartáveis e capaz de receber e-mail (MX/A no DNS).
 *
 * <p>Isto não prova posse do endereço — só o link de verificação prova. É a camada
 * que barra erro de digitação, domínio inventado e caixa temporária.
 */
@Documented
@Constraint(validatedBy = RealEmailValidator.class)
@Target({FIELD, METHOD, PARAMETER, ANNOTATION_TYPE, RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface RealEmail {

    String message() default "e-mail inválido";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
