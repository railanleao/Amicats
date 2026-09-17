package org.amicats.backend.controller.user;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.amicats.backend.application.factory.user.CreateUserFactory;
import org.amicats.backend.application.factory.user.DeactivateUserFactory;
import org.amicats.backend.application.factory.user.ReadUserFactory;
import org.amicats.backend.application.factory.user.UpdateUserFactory;
import org.amicats.backend.domain.usecase.user.create.CreateUserInput;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.domain.usecase.user.update.UpdateUserInput;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UserControllerImpl implements UserController {

    private final CreateUserFactory createUserFactory;
    private final ReadUserFactory readUserFactory;
    private final UpdateUserFactory updateUserFactory;
    private final DeactivateUserFactory deactivateUserFactory;

    @Override
    public List<ReadUserOutput> list() {
        return readUserFactory.criar().findAll();
    }

    @Override
    public ReadUserOutput findById(Integer id) {
        return readUserFactory.criar().findById(id);
    }

    @Override
    public ReadUserOutput create(CreateUserInput input) {
        return createUserFactory.criar().execute(input);
    }

    @Override
    public ReadUserOutput update(Integer id, UpdateUserInput input) {
        return updateUserFactory.criar().execute(id, input);
    }

    @Override
    public ResponseEntity<Void> deactivate(Integer id) {
        deactivateUserFactory.criar().execute(id);
        return ResponseEntity.noContent().build();
    }
}