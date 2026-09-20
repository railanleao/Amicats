UPDATE user_auths
SET email = lower(trim(email))
WHERE email <> lower(trim(email));
