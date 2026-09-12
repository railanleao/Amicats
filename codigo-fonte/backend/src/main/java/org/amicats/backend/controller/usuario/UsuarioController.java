package org.amicats.backend.controller.usuario;

import jakarta.validation.Valid;
import java.util.List;
import org.amicats.backend.domain.usecase.usuario.atualizar.AtualizarUsuarioInput;
import org.amicats.backend.domain.usecase.usuario.buscar.BuscarUsuarioOutput;
import org.amicats.backend.domain.usecase.usuario.inserir.InserirUsuarioInput;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/usuarios")
public interface UsuarioController {

    @GetMapping
    List<BuscarUsuarioOutput> listar();

    @GetMapping("/{id}")
    BuscarUsuarioOutput buscarPorId(@PathVariable Long id);

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    BuscarUsuarioOutput cadastrar(@Valid @RequestBody InserirUsuarioInput input);

    @PutMapping("/{id}")
    BuscarUsuarioOutput editar(@PathVariable Long id, @Valid @RequestBody AtualizarUsuarioInput input);

    @PatchMapping("/{id}/desativar")
    ResponseEntity<Void> desativar(@PathVariable Long id);
}