package org.amicats.backend.domain.entity;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.amicats.backend.domain.enums.TipoAcesso;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    private Long idUsuario;
    private String nomeCompleto;
    private String email;
    private String senhaHash;
    private String telefone;
    private String fotoUrl;
    private TipoAcesso tipoAcesso;
    private String crmv;
    private String ufCrmv;
    private LocalDateTime dataAceiteTermos;
    private boolean ativo;
    private LocalDateTime dataCriacao;
}