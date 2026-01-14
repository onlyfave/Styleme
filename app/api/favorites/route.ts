import sql from "@/app/api/utils/sql";

// Simple auth function
async function auth() {
  return { user: { id: null as string | null } };
}

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get favorites with outfit details
    const favorites = await sql`
      SELECT 
        f.id,
        f.user_id,
        f.outfit_id,
        f.created_at,
        json_build_object(
          'id', o.id,
          'category', o.category,
          'image_url', o.image_url,
          'title', o.title,
          'description', o.description,
          'body_types', o.body_types,
          'source', o.source
        ) as outfit
      FROM favorites f
      JOIN outfits o ON f.outfit_id = o.id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
    `;

    return Response.json({ favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return Response.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { outfitId } = await request.json();

    if (!outfitId) {
      return Response.json({ error: "Outfit ID required" }, { status: 400 });
    }

    // Check if already favorited
    const existing = await sql`
      SELECT id FROM favorites
      WHERE user_id = ${userId} AND outfit_id = ${outfitId}
    `;

    if (existing.length > 0) {
      return Response.json({ message: "Already favorited" });
    }

    // Add favorite
    const result = await sql`
      INSERT INTO favorites (user_id, outfit_id)
      VALUES (${userId}, ${outfitId})
      RETURNING id
    `;

    return Response.json({ id: result[0].id, message: "Added to favorites" });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return Response.json({ error: "Failed to add favorite" }, { status: 500 });
  }
}