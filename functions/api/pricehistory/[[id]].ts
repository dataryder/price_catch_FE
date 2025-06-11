export const onRequest: PagesFunction<Env> = async (context) => {
  const id = context.params.id;
  const sql_query = `SELECT
  date, avg(price) as average, MEDIAN(price) as median, MIN(price) as minimum, MAX(price) as maximum
  FROM main.pricecatcher
  where item_code = ${id}
    AND date between datetrunc('day', current_timestamp AT TIME ZONE 'Asia/Kuching') - INTERVAL 2 YEARS AND  datetrunc('day', current_timestamp AT TIME ZONE 'Asia/Kuching') - INTERVAL 1 days
  group by date, item_code
  order by date ASC`;
  const query_response = await fetch(
    `https://duckdb-data-api-fawn.vercel.app/execute/sql`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({"query":sql_query}),
    }
  );

  const data = await query_response.json();
  return Response.json(data);
};
