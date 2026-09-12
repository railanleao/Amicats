package org.amicats.backend.domain.usecase.usuario.inserir;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.amicats.backend.domain.enums.TipoAcesso;

public record InserirUsuarioInput(
        @NotBlank String nomeCompleto,
        @NotBlank @Email String email,
        @NotBlank String senha,
        String telefone,
        String fotoUrl,
        @NotNull TipoAcesso tipoAcesso,
        String crmv,
        String ufCrmv) {}