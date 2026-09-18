ALTER TABLE user_auths
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT FALSE;
