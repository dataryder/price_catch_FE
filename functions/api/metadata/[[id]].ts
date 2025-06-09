interface Env {
	PRICECATCHER_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const id = context.params.id;
	const ps = context.env.PRICECATCHER_DB.prepare(`WITH max_time AS
  (SELECT a.*
   FROM pricecatcher AS a
   INNER JOIN
     (SELECT item_code,
             MAX(date) AS date
      FROM pricecatcher
      WHERE item_code = ?
      GROUP BY item_code) b ON a.date = b.date
   AND a.item_code = b.item_code),

     ranked_prices AS
  (SELECT item_code,
          price, date, ROW_NUMBER() OVER (PARTITION BY item_code
                                          ORDER BY price ASC) AS rn,
                       COUNT(*) OVER (PARTITION BY item_code) AS total_count
   FROM max_time),

     item_pricestats AS
  (SELECT item_code,
          MIN(price) AS minimum,
          MAX(CASE
                  WHEN rn = (total_count + 1) / 2 THEN price
              END) AS median,
          MAX(CASE
                  WHEN rn = ROUND(total_count * 0.75) THEN price
              END) AS q75,
          MAX(price) AS maximum,
          MAX(date) AS last_updated
   FROM ranked_prices
   GROUP BY item_code)

SELECT im.item_code,
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
FROM item_pricestats AS ps
INNER JOIN lookup_item AS im ON ps.item_code = im.item_code
INNER JOIN item_freq AS ifq ON ps.item_code = ifq.item_code;`)
		.bind(Number(id));

	const data = await ps.run();
	return Response.json(data["results"]);
};

