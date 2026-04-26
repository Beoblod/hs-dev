-- HelloService — competitor prices staleness view
-- Run: docker exec helloservice-postgres-1 psql -U helloservice -d helloservice -f /tmp/stale_prices_view.sql

CREATE OR REPLACE VIEW v_stale_competitor_prices AS
SELECT
    cp.id,
    c.name              AS competitor_name,
    c.website_url,
    dm.name             AS model_name,
    rt.name             AS repair_type_name,
    cp.price,
    cp.source_url,
    cp.checked_at,
    CASE
        WHEN cp.checked_at IS NULL              THEN 'never'
        WHEN cp.checked_at < NOW() - INTERVAL '90 days' THEN 'stale_90'
        WHEN cp.checked_at < NOW() - INTERVAL '30 days' THEN 'stale_30'
        ELSE 'fresh'
    END AS freshness
FROM competitor_prices cp
JOIN competitors    c  ON c.id  = cp.competitor_id
JOIN device_models  dm ON dm.id = cp.model_id
JOIN repair_types   rt ON rt.id = cp.repair_type_id
ORDER BY cp.checked_at ASC NULLS FIRST;

-- Verification
SELECT competitor_name, model_name, repair_type_name, price, freshness
FROM v_stale_competitor_prices
LIMIT 20;
