package org.amicats.backend.controller.user;

import jakarta.validation.Valid;
import java.util.List;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.domain.usecase.user.update.UpdateUserInput;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/users")
public interface UserController {

    @GetMapping
    List<ReadUserOutput> list();

    @GetMapping("/{id}")
    ReadUserOutput findById(@PathVariable Integer id);

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ReadUserOutput create(@Valid @RequestBody CreateUserInput input);

    @PutMapping("/{id}")
    ReadUserOutput update(@PathVariable Integer id, @Valid @RequestBody UpdateUserInput input);

    @PatchMapping("/{id}/deactivate")
    ResponseEntity<Void> deactivate(@PathVariable Integer id);
}