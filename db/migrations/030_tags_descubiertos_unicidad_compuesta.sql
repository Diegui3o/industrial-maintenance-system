ALTER TABLE tags_descubiertos
    DROP CONSTRAINT IF EXISTS tags_descubiertos_tag_name_key;

ALTER TABLE tags_descubiertos
    ADD CONSTRAINT uq_tags_descubiertos_identidad_pi
    UNIQUE NULLS NOT DISTINCT (
        tag_name,
        element_path,
        pi_point_name
    );