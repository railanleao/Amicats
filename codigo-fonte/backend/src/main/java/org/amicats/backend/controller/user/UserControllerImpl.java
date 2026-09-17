package org.amicats.backend.controller.user;

import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.user.CreateUserFactory;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserControllerImpl implements UserController {

    private final CreateUserFactory createUserFactory;

    @Override
    public ReadUserOutput create(CreateUserInput input) {
        return createUserFactory.criar().execute(input);
    }
}