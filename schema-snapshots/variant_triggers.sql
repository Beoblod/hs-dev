-- HelloService — pricing triggers for repair_variants + model_repair_catalog
-- Run: docker exec helloservice-postgres-1 psql -U helloservice -d helloservice -f /tmp/variant_triggers.sql

-- ── 0. Drop old repair_quality_prices triggers ────────────────────────────────
DROP TRIGGER IF EXISTS trg_repair_quality_price_calc ON repair_quality_prices;
DROP TRIGGER IF EXISTS trg_model_novelty_cascade     ON device_models;
DROP TRIGGER IF EXISTS trg_repair_type_cascade       ON repair_types;
DROP FUNCTION IF EXISTS fn_calc_repair_quality_price(uuid);
DROP FUNCTION IF EXISTS trg_fn_repair_quality_price();
DROP FUNCTION IF EXISTS trg_fn_model_novelty_cascade();
DROP FUNCTION IF EXISTS trg_fn_repair_type_cascade();

-- ── 1. Main calculation function for repair_variants ─────────────────────────
CREATE OR REPLACE FUNCTION fn_calc_repair_variant(p_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_part_cost       numeric;
    v_delivery_in     numeric;
    v_delivery_out    numeric;
    v_risk_rate       numeric;
    v_labor_rate      numeric;
    v_hours           numeric;
    v_novelty         numeric;
    v_warranty_rate   numeric;
    v_warranty_days   integer;
    v_catalog_id      uuid;
    v_part_price      numeric;
    v_labor_adj       numeric;
    v_warranty_res    numeric;
    v_total           numeric;
BEGIN
    SELECT
        rv.part_cost,
        COALESCE(rv.delivery_cost_inbound,  0),
        COALESCE(rv.delivery_cost_outbound, 0),
        COALESCE(prl.risk_markup_rate, 0),
        COALESCE(rt.labor_rate, 0),
        -- per-variant override first, fallback to repair_type global
        COALESCE(rv.repair_time_hours, rt.repair_time_hours, 1),
        COALESCE(dm.novelty_markup_coefficient, 1),
        COALESCE(wr.rate, 0.04),
        COALESCE(pqt.warranty_days_default, 90),
        rv.catalog_id
    INTO
        v_part_cost, v_delivery_in, v_delivery_out,
        v_risk_rate, v_labor_rate, v_hours,
        v_novelty, v_warranty_rate, v_warranty_days,
        v_catalog_id
    FROM repair_variants rv
    JOIN model_repair_catalog mc  ON mc.id  = rv.catalog_id
    JOIN device_models dm         ON dm.id  = mc.model_id
    JOIN repair_types  rt         ON rt.id  = mc.repair_type_id
    JOIN part_quality_types pqt   ON pqt.id = rv.quality_type_id
    LEFT JOIN part_risk_levels prl ON prl.id = rt.part_risk_level_id
    LEFT JOIN LATERAL (
        SELECT rate FROM warranty_reserves
        WHERE category_id = dm.category_id LIMIT 1
    ) wr ON true
    WHERE rv.id = p_id;

    -- Skip if no part_cost (manual price mode)
    IF v_part_cost IS NULL THEN RETURN; END IF;

    v_part_price   := ROUND(v_part_cost * (1 + v_risk_rate), 2);
    v_labor_adj    := ROUND(v_labor_rate * v_hours * v_novelty, 2);
    v_warranty_res := ROUND(v_labor_adj * v_warranty_rate, 2);
    v_total        := v_part_price + v_labor_adj + v_warranty_res
                      + v_delivery_in + v_delivery_out;

    -- Update variant
    UPDATE repair_variants
    SET
        calculated_price = v_total,
        effective_price  = v_total,
        warranty_months  = COALESCE(warranty_months, ROUND(v_warranty_days / 30.0)::integer)
    WHERE id = p_id;

    -- Refresh catalog aggregate (від X грн = MIN effective_price)
    UPDATE model_repair_catalog
    SET
        calculated_price     = (SELECT MIN(effective_price) FROM repair_variants
                                WHERE catalog_id = v_catalog_id AND is_available = true),
        effective_price      = (SELECT MIN(effective_price) FROM repair_variants
                                WHERE catalog_id = v_catalog_id AND is_available = true),
        last_recalculated_at = NOW()
    WHERE id = v_catalog_id;
END;
$$;

-- ── 2. Trigger: repair_variants INSERT/UPDATE ─────────────────────────────────
CREATE OR REPLACE FUNCTION trg_fn_repair_variant()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM fn_calc_repair_variant(NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repair_variant_calc ON repair_variants;
CREATE TRIGGER trg_repair_variant_calc
AFTER INSERT OR UPDATE OF part_cost, repair_time_hours,
                           delivery_cost_inbound, delivery_cost_outbound,
                           quality_type_id, catalog_id
ON repair_variants
FOR EACH ROW EXECUTE FUNCTION trg_fn_repair_variant();

-- ── 3. Trigger: device_models novelty_markup_coefficient change ───────────────
CREATE OR REPLACE FUNCTION trg_fn_model_novelty_cascade()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_id uuid;
BEGIN
    IF NEW.novelty_markup_coefficient IS DISTINCT FROM OLD.novelty_markup_coefficient THEN
        FOR v_id IN
            SELECT rv.id
            FROM repair_variants rv
            JOIN model_repair_catalog mc ON mc.id = rv.catalog_id
            WHERE mc.model_id = NEW.id AND rv.part_cost IS NOT NULL
        LOOP
            PERFORM fn_calc_repair_variant(v_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_model_novelty_cascade ON device_models;
CREATE TRIGGER trg_model_novelty_cascade
AFTER UPDATE OF novelty_markup_coefficient ON device_models
FOR EACH ROW EXECUTE FUNCTION trg_fn_model_novelty_cascade();

-- ── 4. Trigger: repair_types labor/hours/risk change ─────────────────────────
CREATE OR REPLACE FUNCTION trg_fn_repair_type_cascade()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE v_id uuid;
BEGIN
    IF NEW.labor_rate         IS DISTINCT FROM OLD.labor_rate
    OR NEW.repair_time_hours  IS DISTINCT FROM OLD.repair_time_hours
    OR NEW.part_risk_level_id IS DISTINCT FROM OLD.part_risk_level_id
    THEN
        FOR v_id IN
            SELECT rv.id
            FROM repair_variants rv
            JOIN model_repair_catalog mc ON mc.id = rv.catalog_id
            WHERE mc.repair_type_id = NEW.id AND rv.part_cost IS NOT NULL
        LOOP
            PERFORM fn_calc_repair_variant(v_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repair_type_cascade ON repair_types;
CREATE TRIGGER trg_repair_type_cascade
AFTER UPDATE OF labor_rate, repair_time_hours, part_risk_level_id ON repair_types
FOR EACH ROW EXECUTE FUNCTION trg_fn_repair_type_cascade();

-- ── 5. Recalculate existing repair_variants that already have part_cost ───────
DO $$
DECLARE v_id uuid;
BEGIN
    FOR v_id IN
        SELECT id FROM repair_variants WHERE part_cost IS NOT NULL
    LOOP
        PERFORM fn_calc_repair_variant(v_id);
    END LOOP;
END;
$$;

-- ── Verification ──────────────────────────────────────────────────────────────
SELECT
    pqt.name       AS quality,
    mc.model_id,
    mc.repair_type_id,
    rv.part_cost,
    rv.calculated_price,
    rv.effective_price,
    rv.warranty_months,
    mc.effective_price AS catalog_price
FROM repair_variants rv
JOIN model_repair_catalog mc  ON mc.id  = rv.catalog_id
JOIN part_quality_types   pqt ON pqt.id = rv.quality_type_id
ORDER BY pqt.quality_tier DESC;
