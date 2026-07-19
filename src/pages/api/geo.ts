export async function GET() {
  return new Response(
    JSON.stringify({ country: "MY", region: "Selangor" }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
}
