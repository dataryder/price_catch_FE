interface Env {
	PRICECATCHER_DB: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
	const id = context.params.id;
	const ps = context.env.PRICECATCHER_DB.prepare(`WITH premise_t AS (
SELECT premise_code, premise, premise_type, state, district
FROM lookup_premise
),
item_t AS (
SELECT a.* 
FROM pricecatcher AS a
INNER JOIN (
SELECT item_code, max(date) as date 
FROM pricecatcher
where item_code = ?
GROUP BY item_code) b
ON a.date = b.date
AND a.item_code = b.item_code
)

SELECT item_t.date, premise_t.premise, premise_t.premise_type, premise_t.state, premise_t.district, item_t.price
FROM item_t INNER JOIN premise_t
ON item_t.premise_code = premise_t.premise_code
ORDER BY item_t.date, price`)
		.bind(Number(id));

	const data = await ps.run();
	return Response.json(data["results"]);
};

