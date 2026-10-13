CREATE FUNCTION set_updated_at() RETURNS TRIGGER AS
$$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE cats
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE rooms
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE stock_items
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();
ALTER TABLE prescribed_medications
    ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT now();

CREATE INDEX idx_cats_updated_at ON cats (updated_at);
CREATE INDEX idx_rooms_updated_at ON rooms (updated_at);
CREATE INDEX idx_stock_items_updated_at ON stock_items (updated_at);
CREATE INDEX idx_prescribed_medications_updated_at ON prescribed_medications (updated_at);

CREATE TRIGGER trg_cats_updated_at
    BEFORE INSERT OR UPDATE
    ON cats
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rooms_updated_at
    BEFORE INSERT OR UPDATE
    ON rooms
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_stock_items_updated_at
    BEFORE INSERT OR UPDATE
    ON stock_items
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_prescribed_medications_updated_at
    BEFORE INSERT OR UPDATE
    ON prescribed_medications
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE idempotency_keys
(
    id_user               INTEGER      NOT NULL REFERENCES users (id_user),

    idempotency_key       VARCHAR(100) NOT NULL,

    method                VARCHAR(10)  NOT NULL,

    path                  VARCHAR(300) NOT NULL,

    response_status       INTEGER      NOT NULL,

    response_content_type VARCHAR(100),

    response_body         TEXT,

    created_at            TIMESTAMP    NOT NULL DEFAULT now(),

    PRIMARY KEY (id_user, idempotency_key)
);

CREATE INDEX idx_idempotency_keys_created_at ON idempotency_keys (created_at);

CREATE TABLE sync_devices
(
    device_id      VARCHAR(64) PRIMARY KEY,

    id_user        INTEGER      NOT NULL REFERENCES users (id_user),

    device_name    VARCHAR(100),

    platform       VARCHAR(20),

    app_version    VARCHAR(30),

    pending_count  INTEGER      NOT NULL DEFAULT 0 CHECK (pending_count >= 0),

    rejected_count INTEGER      NOT NULL DEFAULT 0 CHECK (rejected_count >= 0),

    last_sync_at   TIMESTAMP,

    last_seen_at   TIMESTAMP    NOT NULL DEFAULT now()
);

CREATE INDEX idx_sync_devices_user ON sync_devices (id_user);
