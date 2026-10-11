-- Must match DoseAdministrationTimePolicy.MAX_FUTURE_SKEW (5 minutes).
ALTER TABLE dose_administrations
    DROP CONSTRAINT chk_dose_administrations_time;

ALTER TABLE dose_administrations
    ADD CONSTRAINT chk_dose_administrations_time
    CHECK (administered_at <= recorded_at + INTERVAL '5 minutes');