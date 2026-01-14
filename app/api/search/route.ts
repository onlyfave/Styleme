import sql from "@/app/api/utils/sql";

export async function POST(request: Request) {
  try {
    const algoliaAppId = process.env.ALGOLIA_APP_ID;
    const algoliaSearchKey = process.env.ALGOLIA_SEARCH_API_KEY;
    const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME || "outfits";

    if (!algoliaAppId || !algoliaSearchKey) {
      return Response.json(
        { error: "Algolia credentials not configured" },
        { status: 500 },
      );
    }

    const { query, filters, bodyType } = await request.json();

    // Build Algolia filters
    let filterString = "";

    if (filters?.category && filters.category !== "All") {
      filterString += `category:"${filters.category}"`;
    }

    if (bodyType) {
      if (filterString) filterString += " AND ";
      filterString += `body_types:"${bodyType}"`;
    }

    // Search Algolia
    const searchResponse = await fetch(
      `https://${algoliaAppId}-dsn.algolia.net/1/indexes/${algoliaIndexName}/query`,
      {
        method: "POST",
        headers: {
          "X-Algolia-API-Key": algoliaSearchKey,
          "X-Algolia-Application-Id": algoliaAppId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query || "",
          filters: filterString || undefined,
          hitsPerPage: 50,
        }),
      },
    );

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error("Algolia search error:", error);
      return Response.json({ error: "Search failed" }, { status: 500 });
    }

    const searchResults = await searchResponse.json();

    return Response.json({
      hits: searchResults.hits,
      nbHits: searchResults.nbHits,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}