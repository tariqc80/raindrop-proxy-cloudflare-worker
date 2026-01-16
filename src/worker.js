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

    // Handle both root and /suggest endpoints
    if (url.pathname !== "/" && url.pathname !== "/suggest") {
      return new Response("Not found", { status: 404 });
    }

    const query = url.searchParams.get("q")?.trim() || "";

    // Return empty suggestions for empty query
    if (!query) {
      return jsonResponse(["", [], [], []]);
    }

    // Debug endpoint - remove after testing
    if (url.searchParams.get("debug") === "1") {
      const hasToken = !!env.RAINDROP_TOKEN;
      const tokenLength = env.RAINDROP_TOKEN?.length || 0;
      const tokenPreview = env.RAINDROP_TOKEN ? env.RAINDROP_TOKEN.slice(0, 8) + "..." : "NOT SET";
      return jsonResponse({ hasToken, tokenLength, tokenPreview, query });
    }

    try {
      const apiUrl = `https://api.raindrop.io/rest/v1/raindrops/0?search=${encodeURIComponent(query)}&sort=score`;

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${env.RAINDROP_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Raindrop API error: ${response.status}`, errorBody);
        return jsonResponse({ error: response.status, body: errorBody, query });
      }

      const data = await response.json();
      const items = data?.items ?? [];

      // OpenSearch Suggestions format: [query, [completions], [descriptions], [urls]]
      // URLs only - Vivaldi navigates directly when selected
      const results = items.slice(0, 15);
      const urls = results.map((item) => item.link);

      return jsonResponse([query, urls, [], urls]);
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
