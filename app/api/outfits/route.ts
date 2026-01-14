import sql from "@/app/api/utils/sql";

// Simple auth function
async function auth() {
  return { user: { id: null as string | null } };
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let outfits;

    if (session?.user?.id) {
      // Get user's body type for personalized recommendations
      const profile = await sql`
        SELECT body_type FROM user_profiles WHERE user_id = ${session.user.id}
      `;

      const bodyType = profile[0]?.body_type;

      if (bodyType) {
        // Get outfits matching user's body type first, then others
        if (category && category !== "All") {
          outfits = await sql`
            SELECT * FROM outfits
            WHERE category = ${category}
            ORDER BY 
              CASE WHEN ${bodyType} = ANY(body_types) THEN 0 ELSE 1 END,
              created_at DESC
          `;
        } else {
          outfits = await sql`
            SELECT * FROM outfits
            ORDER BY 
              CASE WHEN ${bodyType} = ANY(body_types) THEN 0 ELSE 1 END,
              created_at DESC
          `;
        }
      } else {
        // User has no body type yet, return all outfits
        if (category && category !== "All") {
          outfits = await sql`
            SELECT * FROM outfits
            WHERE category = ${category}
            ORDER BY created_at DESC
          `;
        } else {
          outfits = await sql`
            SELECT * FROM outfits
            ORDER BY created_at DESC
          `;
        }
      }
    } else {
      // Guest user - return all outfits
      if (category && category !== "All") {
        outfits = await sql`
          SELECT * FROM outfits
          WHERE category = ${category}
          ORDER BY created_at DESC
        `;
      } else {
        outfits = await sql`
          SELECT * FROM outfits
          ORDER BY created_at DESC
        `;
      }
    }

    return Response.json({ outfits });
  } catch (error) {
    console.error("Error fetching outfits:", error);
    return Response.json({ error: "Failed to fetch outfits" }, { status: 500 });
  }
}