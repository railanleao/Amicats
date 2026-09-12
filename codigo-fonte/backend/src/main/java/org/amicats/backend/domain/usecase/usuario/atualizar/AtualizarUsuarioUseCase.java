package org.amicats.backend.domain.usecase.usuario.atualizar;

import org.amicats.backend.domain.entity.Usuario;
import org.amicats.backend.exception.RecursoNaoEncontradoException;
import org.amicats.backend.repository.UsuarioMockRepository;
import org.amicats.backend.domain.usecase.usuario.buscar.BuscarUsuarioOutput;
import org.springframework.stereotype.Component;

@Component
public class AtualizarUsuarioUseCase {

    private final UsuarioMockRepository usuarioRepository;

    public AtualizarUsuarioUseCase(UsuarioMockRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public BuscarUsuarioOutput executar(Long id, AtualizarUsuarioInput input) {
        Usuario u = usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + id));
        u.setNomeCompleto(input.nomeCompleto());
        u.setTelefone(input.telefone());
        u.setFotoUrl(input.fotoUrl());
        u.setTipoAcesso(input.tipoAcesso());
        u.setCrmv(input.crmv());
        u.setUfCrmv(input.ufCrmv());
        return new BuscarUsuarioOutput(
                u.getIdUsuario(), u.getNomeCompleto(), u.getEmail(), u.getTelefone(),
                u.getFotoUrl(), u.getTipoAcesso(), u.getCrmv(), u.getUfCrmv(),
                u.isAtivo(), u.getDataCriacao());
    }
}