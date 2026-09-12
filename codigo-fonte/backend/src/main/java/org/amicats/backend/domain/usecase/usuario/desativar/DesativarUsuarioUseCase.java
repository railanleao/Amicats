package org.amicats.backend.domain.usecase.usuario.desativar;

import org.amicats.backend.domain.entity.Usuario;
import org.amicats.backend.exception.RecursoNaoEncontradoException;
import org.amicats.backend.repository.UsuarioMockRepository;
import org.springframework.stereotype.Component;

@Component
public class DesativarUsuarioUseCase {

    private final UsuarioMockRepository usuarioRepository;

    public DesativarUsuarioUseCase(UsuarioMockRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public void executar(Long id) {
        Usuario u = usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + id));
        u.setAtivo(false);
    }
}