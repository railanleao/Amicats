package org.amicats.backend.domain.usecase.usuario.atualizar;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.amicats.backend.domain.enums.TipoAcesso;

public record AtualizarUsuarioInput(
        @NotBlank String nomeCompleto,
        String telefone,
        String fotoUrl,
        @NotNull TipoAcesso tipoAcesso,
        String crmv,
        String ufCrmv) {}