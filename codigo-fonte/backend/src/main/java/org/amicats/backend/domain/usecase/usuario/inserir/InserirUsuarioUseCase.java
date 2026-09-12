package org.amicats.backend.domain.usecase.usuario.inserir;

import java.time.LocalDateTime;
import org.amicats.backend.domain.entity.Usuario;
import org.amicats.backend.repository.UsuarioMockRepository;
import org.amicats.backend.domain.usecase.usuario.buscar.BuscarUsuarioOutput;
import org.springframework.stereotype.Component;

@Component
public class InserirUsuarioUseCase {

    private final UsuarioMockRepository usuarioRepository;

    public InserirUsuarioUseCase(UsuarioMockRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public BuscarUsuarioOutput executar(InserirUsuarioInput input) {
        Usuario u = new Usuario();
        u.setNomeCompleto(input.nomeCompleto());
        u.setEmail(input.email());
        u.setSenhaHash("mock-hash-" + input.senha().hashCode()); // placeholder temporário
        u.setTelefone(input.telefone());
        u.setFotoUrl(input.fotoUrl());
        u.setTipoAcesso(input.tipoAcesso());
        u.setCrmv(input.crmv());
        u.setUfCrmv(input.ufCrmv());
        u.setAtivo(true);
        u.setDataCriacao(LocalDateTime.now());
        usuarioRepository.salvar(u);
        return new BuscarUsuarioOutput(
                u.getIdUsuario(), u.getNomeCompleto(), u.getEmail(), u.getTelefone(),
                u.getFotoUrl(), u.getTipoAcesso(), u.getCrmv(), u.getUfCrmv(),
                u.isAtivo(), u.getDataCriacao());
    }
}