package com.literaryworld.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(

        @NotBlank(message = "username é obrigatório")
        @Size(min = 3, max = 30, message = "username deve ter entre 3 e 30 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "username aceita apenas letras, números e underscore")
        String username,

        @NotBlank(message = "displayName é obrigatório")
        @Size(min = 1, max = 60, message = "displayName deve ter no máximo 60 caracteres")
        String displayName,

        @NotBlank(message = "email é obrigatório")
        @Email(message = "email inválido")
        @Size(max = 255)
        String email,

        @NotBlank(message = "senha é obrigatória")
        @Size(min = 12, max = 128, message = "senha deve ter entre 12 e 128 caracteres")
        String password
) {}