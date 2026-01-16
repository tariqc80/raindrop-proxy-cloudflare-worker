export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    // Only handle /suggest endpoint
    if (url.pathname !== "/suggest") {
      return new Response("Not found", { status: 404 });
    }

    const query = url.searchParams.get("q")?.trim() || "";

    // Return empty suggestions for empty query
    if (!query) {
      return jsonResponse(["", [], [], []]);
    }

    try {
      const apiUrl = `https://api.raindrop.io/v1/raindrops/0?search=${encodeURIComponent(query)}&sort=score`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${env.RAINDROP_TOKEN}`,
        },
      });

      if (!response.ok) {
        console.error(`Raindrop API error: ${response.status}`);
        return jsonResponse([query, [], [], []]);
      }

      const data = await response.json();
      const items = data?.items ?? [];

      // OpenSearch Suggestions format: [query, [titles], [descriptions], [urls]]
      const titles = items.slice(0, 8).map((item) => item.title || item.link);
      const links = items.slice(0, 8).map((item) => item.link);

      return jsonResponse([query, titles, [], links]);
    } catch (error) {
      console.error("Error fetching from Raindrop:", error);
      return jsonResponse([query, [], [], []]);
    }
  },
};

function jsonResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/x-suggestions+json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
