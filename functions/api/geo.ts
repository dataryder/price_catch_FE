export async function onRequest(context: any) {
  const { request } = context;

  // Cloudflare provides geo data automatically based on IP
  const country = request.cf?.country || "XX";
  const region = request.cf?.region || "";

  return new Response(JSON.stringify({ country, region }), {
    headers: {
      "content-type": "application/json",
    },
  });
}
