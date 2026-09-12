package org.amicats.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;
import org.amicats.backend.domain.entity.Usuario;
import org.amicats.backend.domain.enums.TipoAcesso;
import org.springframework.stereotype.Component;

/**
 * TODO: armazenamento em memória, temporário até a TASK-001 entregar a
 * entidade JPA e o UsuarioRepository real (interface Spring Data JPA). A
 * tabela usuario ainda não existe no banco.
 */
@Component
public class UsuarioMockRepository {

    private final List<Usuario> usuarios = new CopyOnWriteArrayList<>();
    private final AtomicLong sequencia = new AtomicLong(1);

    public UsuarioMockRepository() {
        criarMock("Flávia Souza", "flavia.souza@amicats.org", TipoAcesso.AUXILIAR, null, null);
        criarMock("Emanuelle Silva", "emanuelle.silva@amicats.org", TipoAcesso.VETERINARIO, "12345", "MG");
    }

    private void criarMock(String nome, String email, TipoAcesso tipo, String crmv, String uf) {
        Usuario u = new Usuario();
        u.setIdUsuario(sequencia.getAndIncrement());
        u.setNomeCompleto(nome);
        u.setEmail(email);
        u.setSenhaHash("mock-hash");
        u.setTipoAcesso(tipo);
        u.setCrmv(crmv);
        u.setUfCrmv(uf);
        u.setAtivo(true);
        u.setDataCriacao(LocalDateTime.now());
        usuarios.add(u);
    }

    public Usuario salvar(Usuario usuario) {
        if (usuario.getIdUsuario() == null) {
            usuario.setIdUsuario(sequencia.getAndIncrement());
            usuarios.add(usuario);
        }
        return usuario;
    }

    public List<Usuario> listarTodos() {
        return List.copyOf(usuarios);
    }

    public Optional<Usuario> buscarPorId(Long id) {
        return usuarios.stream().filter(u -> u.getIdUsuario().equals(id)).findFirst();
    }
}