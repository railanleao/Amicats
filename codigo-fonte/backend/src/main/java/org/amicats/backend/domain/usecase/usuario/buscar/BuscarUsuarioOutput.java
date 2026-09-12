package org.amicats.backend.domain.usecase.usuario.buscar;

import java.time.LocalDateTime;
import org.amicats.backend.domain.enums.TipoAcesso;

public record BuscarUsuarioOutput(
        Long idUsuario,
        String nomeCompleto,
        String email,
        String telefone,
        String fotoUrl,
        TipoAcesso tipoAcesso,
        String crmv,
        String ufCrmv,
        boolean ativo,
        LocalDateTime dataCriacao) {}