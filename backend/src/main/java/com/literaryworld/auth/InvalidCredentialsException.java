package com.literaryworld.auth;

public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("credenciais inválidas");
    }
}