package org.amicats.backend.controller.usuario;

import java.util.List;
import org.amicats.backend.domain.usecase.usuario.atualizar.AtualizarUsuarioInput;
import org.amicats.backend.domain.usecase.usuario.atualizar.AtualizarUsuarioUseCase;
import org.amicats.backend.domain.usecase.usuario.buscar.BuscarUsuarioOutput;
import org.amicats.backend.domain.usecase.usuario.buscar.BuscarUsuarioUseCase;
import org.amicats.backend.domain.usecase.usuario.desativar.DesativarUsuarioUseCase;
import org.amicats.backend.domain.usecase.usuario.inserir.InserirUsuarioInput;
import org.amicats.backend.domain.usecase.usuario.inserir.InserirUsuarioUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UsuarioControllerImpl implements UsuarioController {

    private final InserirUsuarioUseCase inserirUsuarioUseCase;
    private final AtualizarUsuarioUseCase atualizarUsuarioUseCase;
    private final BuscarUsuarioUseCase buscarUsuarioUseCase;
    private final DesativarUsuarioUseCase desativarUsuarioUseCase;

    public UsuarioControllerImpl(
            InserirUsuarioUseCase inserirUsuarioUseCase,
            AtualizarUsuarioUseCase atualizarUsuarioUseCase,
            BuscarUsuarioUseCase buscarUsuarioUseCase,
            DesativarUsuarioUseCase desativarUsuarioUseCase) {
        this.inserirUsuarioUseCase = inserirUsuarioUseCase;
        this.atualizarUsuarioUseCase = atualizarUsuarioUseCase;
        this.buscarUsuarioUseCase = buscarUsuarioUseCase;
        this.desativarUsuarioUseCase = desativarUsuarioUseCase;
    }

    @Override
    public List<BuscarUsuarioOutput> listar() {
        return buscarUsuarioUseCase.executarTodos();
    }

    @Override
    public BuscarUsuarioOutput buscarPorId(Long id) {
        return buscarUsuarioUseCase.executar(id);
    }

    @Override
    public BuscarUsuarioOutput cadastrar(InserirUsuarioInput input) {
        return inserirUsuarioUseCase.executar(input);
    }

    @Override
    public BuscarUsuarioOutput editar(Long id, AtualizarUsuarioInput input) {
        return atualizarUsuarioUseCase.executar(id, input);
    }

    @Override
    public ResponseEntity<Void> desativar(Long id) {
        desativarUsuarioUseCase.executar(id);
        return ResponseEntity.noContent().build();
    }
}