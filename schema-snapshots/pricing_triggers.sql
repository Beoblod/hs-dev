-- HelloService — pricing auto-calculation triggers
-- Run: docker exec helloservice-postgres-1 psql -U helloservice -d helloservice -f /tmp/pricing_triggers.sql

-- ── 1. Main calculation function ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION fn_calc_repair_quality_price(p_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
DECLARE
    v_part_cost       numeric;
    v_risk_rate       numeric;
    v_labor_rate      numeric;
    v_hours           numeric;
    v_novelty         numeric;
    v_warranty_rate   numeric;
    v_warranty_days   integer;
    v_part_price      numeric;
    v_labor_adj       numeric;
    v_warranty_res    numeric;
    v_total           numeric;
BEGIN
    SELECT
        rqp.part_cost,
        COALESCE(prl.risk_markup_rate, 0),
        COALESCE(rt.labor_rate, 0),
        COALESCE(rt.repair_time_hours, 1),
        COALESCE(dm.novelty_markup_coefficient, 1),
        COALESCE(wr.rate, 0.04),
        COALESCE(pqt.warranty_days_default, 90)
    INTO
        v_part_cost, v_risk_rate, v_labor_rate, v_hours,
        v_novelty, v_warranty_rate, v_warranty_days
    FROM repair_quality_prices rqp
    JOIN repair_types rt        ON rt.id  = rqp.repair_type_id
    JOIN device_models dm       ON dm.id  = rqp.model_id
    JOIN part_quality_types pqt ON pqt.id = rqp.quality_type_id
    LEFT JOIN part_risk_levels prl
           ON prl.id = rt.part_risk_level_id
    LEFT JOIN LATERAL (
        SELECT rate FROM warranty_reserves
        WHERE category_id = dm.category_id LIMIT 1
    ) wr ON true
    WHERE rqp.id = p_id;

    -- Skip if no part_cost (manual price mode)
    IF v_part_cost IS NULL THEN RETURN; END IF;

    v_part_price   := ROUND(v_part_cost * (1 + v_risk_rate), 2);
    v_labor_adj    := ROUND(v_labor_rate * v_hours * v_novelty, 2);
    v_warranty_res := ROUND(v_labor_adj * v_warranty_rate, 2);
    v_total        := v_part_price + v_labor_adj + v_warranty_res;

    UPDATE repair_quality_prices
    SET
        calculated_price = v_total,
        effective_price  = v_total,
        -- Auto-fill warranty_months from quality default only if not set
        warranty_months  = COALESCE(warranty_months, ROUND(v_warranty_days / 30.0)::integer)
    WHERE id = p_id;
END;
$$;

-- ── 2. Trigger: repair_quality_prices INSERT/UPDATE ───────────────────────────
CREATE OR REPLACE FUNCTION trg_fn_repair_quality_price()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    PERFORM fn_calc_repair_quality_price(NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repair_quality_price_calc ON repair_quality_prices;
CREATE TRIGGER trg_repair_quality_price_calc
AFTER INSERT OR UPDATE OF part_cost, repair_type_id, model_id, quality_type_id
ON repair_quality_prices
FOR EACH ROW EXECUTE FUNCTION trg_fn_repair_quality_price();

-- ── 3. Trigger: device_models novelty_markup_coefficient change ───────────────
CREATE OR REPLACE FUNCTION trg_fn_model_novelty_cascade()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
    v_id uuid;
BEGIN
    IF NEW.novelty_markup_coefficient IS DISTINCT FROM OLD.novelty_markup_coefficient THEN
        FOR v_id IN
            SELECT id FROM repair_quality_prices
            WHERE model_id = NEW.id AND part_cost IS NOT NULL
        LOOP
            PERFORM fn_calc_repair_quality_price(v_id);
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
DECLARE
    v_id uuid;
BEGIN
    IF NEW.labor_rate        IS DISTINCT FROM OLD.labor_rate
    OR NEW.repair_time_hours IS DISTINCT FROM OLD.repair_time_hours
    OR NEW.part_risk_level_id IS DISTINCT FROM OLD.part_risk_level_id
    THEN
        FOR v_id IN
            SELECT id FROM repair_quality_prices
            WHERE repair_type_id = NEW.id AND part_cost IS NOT NULL
        LOOP
            PERFORM fn_calc_repair_quality_price(v_id);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_repair_type_cascade ON repair_types;
CREATE TRIGGER trg_repair_type_cascade
AFTER UPDATE OF labor_rate, repair_time_hours, part_risk_level_id ON repair_types
FOR EACH ROW EXECUTE FUNCTION trg_fn_repair_type_cascade();

-- ── 5. Recalculate existing records that already have part_cost ───────────────
DO $$
DECLARE v_id uuid;
BEGIN
    FOR v_id IN SELECT id FROM repair_quality_prices WHERE part_cost IS NOT NULL
    LOOP
        PERFORM fn_calc_repair_quality_price(v_id);
    END LOOP;
END;
$$;

SELECT
    pqt.name AS quality,
    rqp.part_cost,
    rqp.calculated_price,
    rqp.effective_price,
    rqp.warranty_months
FROM repair_quality_prices rqp
JOIN part_quality_types pqt ON pqt.id = rqp.quality_type_id
ORDER BY pqt.quality_tier DESC;
