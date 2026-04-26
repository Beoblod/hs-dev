-- HelloService — auto-create model_repair_catalog when spare_part is linked to a model
-- Run: docker exec helloservice-postgres-1 psql -U helloservice -d helloservice -f /tmp/autocreate_catalog_trigger.sql

-- ── 1. Unique constraint (prevents duplicate model×repair_type rows) ──────────
ALTER TABLE model_repair_catalog
  DROP CONSTRAINT IF EXISTS uq_model_repair_catalog_model_type;

ALTER TABLE model_repair_catalog
  ADD CONSTRAINT uq_model_repair_catalog_model_type
  UNIQUE (model_id, repair_type_id);

-- ── 2. Trigger function ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_fn_autocreate_catalog()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_repair_type_id uuid;
BEGIN
  SELECT repair_type_id INTO v_repair_type_id
  FROM spare_parts WHERE id = NEW.spare_parts_id;

  IF v_repair_type_id IS NULL THEN RETURN NEW; END IF;

  INSERT INTO model_repair_catalog (id, model_id, repair_type_id, is_available)
  VALUES (gen_random_uuid(), NEW.device_models_id, v_repair_type_id, true)
  ON CONFLICT (model_id, repair_type_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ── 3. Trigger on spare_parts_device_models INSERT ───────────────────────────
DROP TRIGGER IF EXISTS trg_autocreate_catalog ON spare_parts_device_models;
CREATE TRIGGER trg_autocreate_catalog
AFTER INSERT ON spare_parts_device_models
FOR EACH ROW EXECUTE FUNCTION trg_fn_autocreate_catalog();

-- ── 4. Backfill: create missing entries for already-linked spare_parts ────────
INSERT INTO model_repair_catalog (id, model_id, repair_type_id, is_available)
SELECT gen_random_uuid(), j.device_models_id, sp.repair_type_id, true
FROM spare_parts sp
JOIN spare_parts_device_models j ON j.spare_parts_id = sp.id
WHERE sp.repair_type_id IS NOT NULL
ON CONFLICT (model_id, repair_type_id) DO NOTHING;

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT
  dm.name        AS model,
  rt.name        AS repair_type,
  mc.effective_price,
  mc.is_available
FROM model_repair_catalog mc
JOIN device_models dm ON dm.id = mc.model_id
JOIN repair_types  rt ON rt.id = mc.repair_type_id
ORDER BY dm.name, rt.name;
