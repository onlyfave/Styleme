import sql from "@/app/api/utils/sql";

// Simple auth function
async function auth() {
  return { user: { id: null as string | null } };
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const outfitId = params.id;

    // Delete favorite
    await sql`
      DELETE FROM favorites
      WHERE user_id = ${userId} AND outfit_id = ${outfitId}
    `;

    return Response.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return Response.json(
      { error: "Failed to remove favorite" },
      { status: 500 },
    );
  }
}