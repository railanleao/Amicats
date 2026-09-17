package org.amicats.backend.domain.usecase.user.update;

import lombok.Builder;
import org.amicats.backend.domain.entity.User;
import org.amicats.backend.domain.interfaces.dataprovider.user.UserDataProvider;
import org.amicats.backend.domain.usecase.user.read.ReadUserOutput;
import org.amicats.backend.exception.ResourceNotFoundException;
import org.springframework.transaction.annotation.Transactional;

@Builder
public class UpdateUserUseCase {

    private UserDataProvider userDataProvider;

    @Transactional
    public ReadUserOutput execute(Integer id, UpdateUserInput input) {
        User user = userDataProvider.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));

        user.setFullName(input.fullName());
        user.setAccessType(input.accessType());

        if (input.phoneNumber() != null) {
            user.setPhoneNumber(input.phoneNumber());
        }
        if (input.imageUrl() != null) {
            user.setImageUrl(input.imageUrl());
        }
        if (input.crmv() != null) {
            user.setCrmv(input.crmv());
        }
        if (input.ufCrmv() != null) {
            user.setUfCrmv(input.ufCrmv());
        }

        userDataProvider.saveUser(user);

        String email = userDataProvider.findEmailByUserId(user.getId()).orElse(null);
        return ReadUserOutput.from(user, email);
    }
}