-- HelloService — pricing triggers for spare_parts
-- Run: docker exec helloservice-postgres-1 psql -U helloservice -d helloservice -f /tmp/spare_parts_triggers.sql

-- ── 0. Drop old repair_variants triggers ──────────────────────────────────────
DROP TRIGGER IF EXISTS trg_repair_variant_calc    ON repair_variants;
DROP TRIGGER IF EXISTS trg_model_novelty_cascade  ON device_models;
DROP TRIGGER IF EXISTS trg_repair_type_cascade    ON repair_types;
DROP TRIGGER IF EXISTS trg_catalog_time_cascade   ON model_repair_catalog;
DROP FUNCTION IF EXISTS fn_calc_repair_variant(uuid);
DROP FUNCTION IF EXISTS trg_fn_repair_variant();
DROP FUNCTION IF EXISTS trg_fn_model_novelty_cascade();
DROP FUNCTION IF EXISTS trg_fn_repair_type_cascade();

-- ── 1. Main calculation function ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_calc_spare_part(p_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_reference_price  numeric;
    v_risk_rate        numeric;
    v_labor_rate       numeric;
    v_hours            numeric;
    v_warranty_rate    numeric;
    v_warranty_days    integer;
    v_repair_type_id   uuid;
    v_model_id         uuid;
    v_catalog_id       uuid;
    v_part_price       numeric;
    v_labor_adj        numeric;
    v_warranty_res     numeric;
    v_total            numeric;
BEGIN
    -- Get spare_part data + first linked model + model_repair_catalog override
    SELECT
        sp.reference_price,
        COALESCE(prl.risk_markup_rate, 0),
        COALESCE(rt.labor_rate, 0),
        -- repair_time_hours: model_repair_catalog override → repair_types default → 1
        COALESCE(mc.repair_time_hours, rt.repair_time_hours, 1),
        COALESCE(wr.rate, 0.04),
        COALESCE(pqt_dummy.warranty_days_default, 90),
        sp.repair_type_id,
        dm.id,
        mc.id
    INTO
        v_reference_price, v_risk_rate, v_labor_rate, v_hours,
        v_warranty_rate, v_warranty_days,
        v_repair_type_id, v_model_id, v_catalog_id
    FROM spare_parts sp
    JOIN repair_types rt ON rt.id = sp.repair_type_id
    LEFT JOIN part_risk_levels prl ON prl.id = rt.part_risk_level_id
    -- First linked model (for catalog lookup)
    LEFT JOIN LATERAL (
        SELECT device_models_id FROM spare_parts_device_models
        WHERE spare_parts_id = sp.id LIMIT 1
    ) spdm ON true
    LEFT JOIN device_models dm ON dm.id = spdm.device_models_id
    -- model_repair_catalog for repair_time_hours override
    LEFT JOIN LATERAL (
        SELECT id, repair_time_hours FROM model_repair_catalog
        WHERE model_id = dm.id AND repair_type_id = sp.repair_type_id
        LIMIT 1
    ) mc ON true
    -- warranty_reserves by model category
    LEFT JOIN LATERAL (
        SELECT rate FROM warranty_reserves
        WHERE category_id = dm.category_id LIMIT 1
    ) wr ON true
    -- warranty_days: use first part_quality_types record as fallback default
    LEFT JOIN LATERAL (
        SELECT warranty_days_default FROM part_quality_types
        ORDER BY quality_tier DESC LIMIT 1
    ) pqt_dummy ON true
    WHERE sp.id = p_id;

    -- Skip if no reference_price (manual price mode)
    IF v_reference_price IS NULL THEN RETURN; END IF;

    v_part_price   := ROUND(v_reference_price * (1 + v_risk_rate), 2);
    v_labor_adj    := ROUND(v_labor_rate * v_hours, 2);
    v_warranty_res := ROUND(v_labor_adj * v_warranty_rate, 2);
    v_total        := v_part_price + v_labor_adj + v_warranty_res;

    -- Update spare_part
    UPDATE spare_parts
    SET
        calculated_price = v_total,
        effective_price  = v_total,
        warranty_months  = COALESCE(warranty_months, ROUND(v_warranty_days / 30.0)::integer)
    WHERE id = p_id;

    -- Refresh model_repair_catalog aggregate (від X грн = MIN effective_price)
    IF v_catalog_id IS NOT NULL THEN
        UPDATE model_repair_catalog
        SET
            calculated_price     = (
                SELECT MIN(sp2.effective_price)
                FROM spare_parts sp2
                JOIN spare_parts_device_models j ON j.spare_parts_id = sp2.id
                WHERE j.device_models_id = v_model_id
                  AND sp2.repair_type_id = v_repair_type_id
                  AND sp2.is_serviceable = true
            ),
            effective_price      = (
                SELECT MIN(sp2.effective_price)
                FROM spare_parts sp2
                JOIN spare_parts_device_models j ON j.spare_parts_id = sp2.id
                WHERE j.device_models_id = v_model_id
                  AND sp2.repair_type_id = v_repair_type_id
                  AND sp2.is_serviceable = true
            ),
            last_recalculated_at = NOW()
        WHERE id = v_catalog_id;
    END IF;
END;
$$;

-- ── 2. Trigger: spare_parts INSERT/UPDATE ────────────────────────────────────
CREATE OR REPLACE FUNCTION trg_fn_spare_part()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM fn_calc_spare_part(NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_spare_part_calc ON spare_parts;
CREATE TRIGGER trg_spare_part_calc
AFTER INSERT OR UPDATE OF reference_price, repair_type_id, is_serviceable
ON spare_parts
FOR EACH ROW EXECUTE FUNCTION trg_fn_spare_part();

-- ── 3. Trigger: repair_types labor/hours/risk change ─────────────────────────
CREATE OR REPLACE FUNCTION trg_fn_repair_type_spare_cascade()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_id uuid;
BEGIN
    IF NEW.labor_rate         IS DISTINCT FROM OLD.labor_rate
    OR NEW.repair_time_hours  IS DISTINCT FROM OLD.repair_time_hours
    OR NEW.part_risk_level_id IS DISTINCT FROM OLD.part_risk_level_id
    THEN
        FOR v_id IN
            SELECT id FROM spare_parts
            WHERE repair_type_id = NEW.id AND reference_price IS NOT NULL
        LOOP
            PERFORM fn_calc_spare_part(v_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repair_type_spare_cascade ON repair_types;
CREATE TRIGGER trg_repair_type_spare_cascade
AFTER UPDATE OF labor_rate, repair_time_hours, part_risk_level_id ON repair_types
FOR EACH ROW EXECUTE FUNCTION trg_fn_repair_type_spare_cascade();

-- ── 4. Trigger: model_repair_catalog repair_time_hours change ────────────────
CREATE OR REPLACE FUNCTION trg_fn_catalog_time_cascade()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_id uuid;
BEGIN
    IF NEW.repair_time_hours IS DISTINCT FROM OLD.repair_time_hours THEN
        FOR v_id IN
            SELECT sp.id
            FROM spare_parts sp
            JOIN spare_parts_device_models j ON j.spare_parts_id = sp.id
            WHERE j.device_models_id = NEW.model_id
              AND sp.repair_type_id  = NEW.repair_type_id
              AND sp.reference_price IS NOT NULL
        LOOP
            PERFORM fn_calc_spare_part(v_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_catalog_time_cascade ON model_repair_catalog;
CREATE TRIGGER trg_catalog_time_cascade
AFTER UPDATE OF repair_time_hours ON model_repair_catalog
FOR EACH ROW EXECUTE FUNCTION trg_fn_catalog_time_cascade();

-- ── 5. Recalculate existing spare_parts ──────────────────────────────────────
DO $$
DECLARE v_id uuid;
BEGIN
    FOR v_id IN SELECT id FROM spare_parts WHERE reference_price IS NOT NULL
    LOOP
        PERFORM fn_calc_spare_part(v_id);
    END LOOP;
END;
$$;

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT
    sp.name,
    sp.reference_price,
    sp.calculated_price,
    sp.effective_price,
    sp.warranty_months,
    mc.effective_price AS catalog_min_price
FROM spare_parts sp
LEFT JOIN spare_parts_device_models j  ON j.spare_parts_id = sp.id
LEFT JOIN model_repair_catalog mc
       ON mc.model_id = j.device_models_id AND mc.repair_type_id = sp.repair_type_id
ORDER BY sp.name;
