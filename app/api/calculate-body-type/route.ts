import sql from "@/app/api/utils/sql";

// Simple auth function
async function auth() {
  return { user: { id: null as string | null } };
}

type BodyTypeAnswers = {
  shoulder_hip_ratio: string;
  volume_area: string;
};

// Rule-based body type calculation logic
function calculateBodyType(answers: BodyTypeAnswers) {
  const { shoulder_hip_ratio, volume_area } = answers;

  // Hourglass: balanced shoulders/hips with defined waist
  if (shoulder_hip_ratio === "about_same" && volume_area === "balanced") {
    return "Hourglass";
  }

  // Pear: hips wider than shoulders
  if (shoulder_hip_ratio === "hips_wider" || volume_area === "bottom") {
    return "Pear";
  }

  // Apple: volume in midsection
  if (volume_area === "middle") {
    return "Apple";
  }

  // Inverted Triangle: shoulders wider than hips
  if (shoulder_hip_ratio === "shoulders_wider" || volume_area === "top") {
    return "Inverted Triangle";
  }

  // Rectangle: balanced proportions
  if (shoulder_hip_ratio === "about_same") {
    return "Rectangle";
  }

  // Default fallback
  return "Rectangle";
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    const { shoulder_hip_ratio, volume_area, preferred_fit, height_range } =
      body;

    // Calculate body type
    const bodyType = calculateBodyType({ shoulder_hip_ratio, volume_area });

    // If user is authenticated, save to database
    if (session?.user?.id) {
      const userId = session.user.id;

      // Check if profile exists
      const existing = await sql`
        SELECT id FROM user_profiles WHERE user_id = ${userId}
      `;

      if (existing.length > 0) {
        // Update existing profile
        await sql`
          UPDATE user_profiles
          SET 
            body_type = ${bodyType},
            shoulder_hip_ratio = ${shoulder_hip_ratio},
            volume_area = ${volume_area},
            preferred_fit = ${preferred_fit || null},
            height_range = ${height_range || null},
            updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ${userId}
        `;
      } else {
        // Create new profile
        await sql`
          INSERT INTO user_profiles (
            user_id,
            body_type,
            shoulder_hip_ratio,
            volume_area,
            preferred_fit,
            height_range
          ) VALUES (
            ${userId},
            ${bodyType},
            ${shoulder_hip_ratio},
            ${volume_area},
            ${preferred_fit || null},
            ${height_range || null}
          )
        `;
      }
    }

    return Response.json({ bodyType });
  } catch (error) {
    console.error("Error calculating body type:", error);
    return Response.json(
      { error: "Failed to calculate body type" },
      { status: 500 },
    );
  }
}