export async function onRequest(context) {
  const url = new URL(context.request.url);

  // Fetch the actual static index.html
  const response = await context.next();

  // Only intercept requests to /item/:itemCode
  const itemMatch = url.pathname.match(/^\/item\/(\d+)$/);

  if (itemMatch) {
    const itemCode = itemMatch[1];

    // OPTIONAL: Fetch the actual item name from a lightweight JSON index in your lake
    // const metaReq = await fetch('https://pricecatcher-lake.iwa.my/data/item_names.json');
    // const metaMap = await metaReq.json();
    // const itemName = metaMap[itemCode] || `Item #${itemCode}`;

    // Fallback if you don't have a JSON map
    const itemName = `Product #${itemCode}`;
    const dynamicTitle = `${itemName} | OpenPriceCatcher`;
    const dynamicDesc = `Track and compare prices for ${itemName} across Malaysia.`;

    // Use HTMLRewriter to inject the meta tags BEFORE social media bots see the HTML
    return new HTMLRewriter()
      .on("title", {
        element(e) {
          e.setInnerContent(dynamicTitle);
        },
      })
      .on('meta[property="og:title"]', {
        element(e) {
          e.setAttribute("content", dynamicTitle);
        },
      })
      .on('meta[name="twitter:title"]', {
        element(e) {
          e.setAttribute("content", dynamicTitle);
        },
      })
      .on('meta[name="description"]', {
        element(e) {
          e.setAttribute("content", dynamicDesc);
        },
      })
      .on('meta[property="og:description"]', {
        element(e) {
          e.setAttribute("content", dynamicDesc);
        },
      })
      .transform(response);
  }

  // Return normal response for all other routes
  return response;
}
