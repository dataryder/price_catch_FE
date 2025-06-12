export const onRequest: PagesFunction<Env> = async () => {
	const response = await fetch("https://pub-0725b434f0414f52b90e99dd024acc67.r2.dev/pricecatcher/item_category_price_index.json")
	const json = await response.json()
	return Response.json(json)
}