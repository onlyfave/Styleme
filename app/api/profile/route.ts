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

    const profiles = await sql`
      SELECT * FROM user_profiles
      WHERE user_id = ${userId}
    `;

    const profile = profiles[0] || null;

    return Response.json({ profile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    const {
      body_type,
      shoulder_hip_ratio,
      volume_area,
      preferred_fit,
      height_range,
    } = body;

    // Check if profile exists
    const existing = await sql`
      SELECT id FROM user_profiles WHERE user_id = ${userId}
    `;

    if (existing.length > 0) {
      // Update existing profile
      const updates = [];
      const values = [];

      if (body_type !== undefined) {
        updates.push(`body_type = $${values.length + 1}`);
        values.push(body_type);
      }
      if (shoulder_hip_ratio !== undefined) {
        updates.push(`shoulder_hip_ratio = $${values.length + 1}`);
        values.push(shoulder_hip_ratio);
      }
      if (volume_area !== undefined) {
        updates.push(`volume_area = $${values.length + 1}`);
        values.push(volume_area);
      }
      if (preferred_fit !== undefined) {
        updates.push(`preferred_fit = $${values.length + 1}`);
        values.push(preferred_fit);
      }
      if (height_range !== undefined) {
        updates.push(`height_range = $${values.length + 1}`);
        values.push(height_range);
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      if (values.length > 0) {
        // Use parameterized query with sql template literal
        await sql`
          UPDATE user_profiles
          SET 
            ${body_type !== undefined ? sql`body_type = ${body_type}` : sql``}
            ${
              shoulder_hip_ratio !== undefined
                ? sql`, shoulder_hip_ratio = ${shoulder_hip_ratio}`
                : sql``
            }
            ${
              volume_area !== undefined
                ? sql`, volume_area = ${volume_area}`
                : sql``
            }
            ${
              preferred_fit !== undefined
                ? sql`, preferred_fit = ${preferred_fit}`
                : sql``
            }
            ${
              height_range !== undefined
                ? sql`, height_range = ${height_range}`
                : sql``
            }
            , updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;

        const result = await sql`
          SELECT * FROM user_profiles WHERE user_id = ${userId}
        `;
        return Response.json({ profile: result[0] });
      }

      return Response.json({ message: "No updates provided" });
    } else {
      // Create new profile
      const result = await sql`
        INSERT INTO user_profiles (
          user_id,
          body_type,
          shoulder_hip_ratio,
          volume_area,
          preferred_fit,
          height_range
        ) VALUES (
          ${userId},
          ${body_type || null},
          ${shoulder_hip_ratio || null},
          ${volume_area || null},
          ${preferred_fit || null},
          ${height_range || null}
        )
        RETURNING *
      `;

      return Response.json({ profile: result[0] });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return Response.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
