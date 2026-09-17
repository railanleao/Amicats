package org.amicats.backend.controller.user;

import jakarta.validation.Valid;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;

@RequestMapping("/users")
public interface UserController {

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ReadUserOutput create(@Valid @RequestBody CreateUserInput input);
}