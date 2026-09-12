package org.amicats.backend.domain.usecase.usuario.buscar;

import java.util.List;
import org.amicats.backend.domain.entity.Usuario;
import org.amicats.backend.exception.RecursoNaoEncontradoException;
import org.amicats.backend.repository.UsuarioMockRepository;
import org.springframework.stereotype.Component;

@Component
public class BuscarUsuarioUseCase {

    private final UsuarioMockRepository usuarioRepository;

    public BuscarUsuarioUseCase(UsuarioMockRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public BuscarUsuarioOutput executar(Long id) {
        Usuario u = usuarioRepository.buscarPorId(id)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado: " + id));
        return toOutput(u);
    }

    public List<BuscarUsuarioOutput> executarTodos() {
        return usuarioRepository.listarTodos().stream().map(this::toOutput).toList();
    }

    private BuscarUsuarioOutput toOutput(Usuario u) {
        return new BuscarUsuarioOutput(
                u.getIdUsuario(), u.getNomeCompleto(), u.getEmail(), u.getTelefone(),
                u.getFotoUrl(), u.getTipoAcesso(), u.getCrmv(), u.getUfCrmv(),
                u.isAtivo(), u.getDataCriacao());
    }
}