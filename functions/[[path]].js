import { slugify } from "../src/lib/slug";

const LOOKUP_URL = "https://pricecatcher-lake.iwa.my/data/item_lookup.json";

// Short URLs that people and agents tend to guess, mapped to the real pages.
//   /item/1611        -> /item/santan-kelapa-jenama-kara-1611/
//   /categories       -> /category/
export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (/^\/categor(y|ies)$|^\/categories\/$/.test(url.pathname)) {
    return Response.redirect(new URL(`/category/${url.search}`, url), 301);
  }

  const itemMatch = url.pathname.match(/^\/item\/(\d+)\/?$/);
  if (itemMatch) {
    const itemCode = itemMatch[1];
    try {
      const res = await fetch(LOOKUP_URL, { cf: { cacheTtl: 3600, cacheEverything: true } });
      const lookup = res.ok ? await res.json() : {};
      const itemName = lookup[itemCode];
      if (itemName) {
        return Response.redirect(
          new URL(`/item/${slugify(itemName)}-${itemCode}/${url.search}`, url),
          301,
        );
      }
    } catch {
      // Fall through to the normal 404 page.
    }
  }

  return context.next();
}
