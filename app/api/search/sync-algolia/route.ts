import sql from "@/app/api/utils/sql";

// Sync outfits to Algolia search index
export async function POST() {
  try {
    const algoliaAppId = process.env.ALGOLIA_APP_ID;
    const algoliaApiKey = process.env.ALGOLIA_ADMIN_API_KEY;
    const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME || "outfits";

    if (!algoliaAppId || !algoliaApiKey) {
      return Response.json(
        { error: "Algolia credentials not configured" },
        { status: 500 },
      );
    }

    // Fetch all outfits from database
    const outfits = await sql`SELECT * FROM outfits`;

    // Prepare records for Algolia (add objectID)
    const records = outfits.map((outfit: any) => ({
      objectID: outfit.id.toString(),
      id: outfit.id,
      category: outfit.category,
      title: outfit.title,
      description: outfit.description,
      image_url: outfit.image_url,
      body_types: outfit.body_types,
      source: outfit.source,
      created_at: outfit.created_at,
    }));

    // Sync to Algolia
    const response = await fetch(
      `https://${algoliaAppId}-dsn.algolia.net/1/indexes/${algoliaIndexName}/batch`,
      {
        method: "POST",
        headers: {
          "X-Algolia-API-Key": algoliaApiKey,
          "X-Algolia-Application-Id": algoliaAppId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requests: records.map((record: any) => ({
            action: "updateObject",
            body: record,
          })),
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Algolia sync error:", error);
      return Response.json(
        { error: "Failed to sync with Algolia" },
        { status: 500 },
      );
    }

    const result = await response.json();

    return Response.json({
      message: "Successfully synced outfits to Algolia",
      count: records.length,
      result,
    });
  } catch (error) {
    console.error("Error syncing to Algolia:", error);
    return Response.json({ error: "Failed to sync outfits" }, { status: 500 });
  }
}