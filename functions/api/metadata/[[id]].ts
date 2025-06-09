interface Env {
  PRICECATCHER_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const id = context.params.id;
  const ps = context.env.PRICECATCHER_DB.prepare(`WITH latest_ranked_prices AS (
  SELECT
    item_code,
    price,
    date,
    ROW_NUMBER() OVER (ORDER BY price ASC) AS rn,
    COUNT(*) OVER () AS total_count
  FROM pricecatcher
  WHERE
    item_code = ?1
    AND date = (
      SELECT MAX(date)
      FROM pricecatcher
      WHERE item_code = ?1
    )
)
SELECT
  im.item_code,
  im.item,
  im.unit,
  im.item_group,
  im.item_category,
  ps.median,
  ps.minimum,
  ps.q75,
  ps.maximum,
  ps.last_updated,
  ifq.frequency
FROM (
  SELECT
    item_code,
    MIN(price) AS minimum,
    MAX(price) AS maximum,
    MAX(date) AS last_updated,
    MAX(CASE WHEN rn = (total_count + 1) / 2 THEN price END) AS median,
    MAX(CASE WHEN rn = ROUND(total_count * 0.75) THEN price END) AS q75
  FROM latest_ranked_prices
  GROUP BY item_code
) AS ps
INNER JOIN lookup_item AS im ON ps.item_code = im.item_code
INNER JOIN item_freq AS ifq ON ps.item_code = ifq.item_code;`)
    .bind(Number(id));

  const data = await ps.run();
  return Response.json(data["results"]);
};

