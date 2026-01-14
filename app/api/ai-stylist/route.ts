import sql from "@/app/api/utils/sql";

// Simple auth function
async function auth() {
  return { user: { id: null as string | null, name: null as string | null, email: null as string | null } };
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const { messages, userMessage } = await request.json();

    // Get user's body type for personalized recommendations
    let bodyType = null;
    let userName = "friend";

    if (session?.user?.id) {
      const profile = await sql`
        SELECT body_type FROM user_profiles WHERE user_id = ${session.user.id}
      `;
      bodyType = profile[0]?.body_type;
      userName =
        session.user.name || session.user.email?.split("@")[0] || "friend";
    }

    // Search outfits based on the user's message
    const algoliaAppId = process.env.ALGOLIA_APP_ID;
    const algoliaSearchKey = process.env.ALGOLIA_SEARCH_API_KEY;
    const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME || "outfits";

    let outfitContext = "";

    if (algoliaAppId && algoliaSearchKey) {
      // Search Algolia for relevant outfits
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
            query: userMessage,
            filters: bodyType ? `body_types:"${bodyType}"` : undefined,
            hitsPerPage: 5,
          }),
        },
      );

      if (searchResponse.ok) {
        const results = await searchResponse.json();
        if (results.hits.length > 0) {
          outfitContext =
            "\n\nRelevant outfit recommendations from our collection:\n" +
            results.hits
              .map(
                (hit: any, i: number) =>
                  `${i + 1}. ${hit.title} (${hit.category}) - ${hit.description}`,
              )
              .join("\n");
        }
      }
    }

    // Build system message with context
    const systemMessage = {
      role: "system",
      content: `You are StyleLove's personal AI styling assistant - warm, enthusiastic, and body-positive! 

Your role:
- Help users discover clothing styles that make them feel confident and beautiful
- Provide personalized styling advice based on their body type and preferences
- Be supportive, encouraging, and never judgmental
- Use a friendly, conversational tone (think: chatting with a supportive best friend)
- Keep responses concise but helpful (2-3 short paragraphs max)

User Context:
- User's name: ${userName}
${bodyType ? `- Body type: ${bodyType}` : "- Body type: Not yet determined (suggest they take the quiz!)"}

When recommending outfits:
- Reference specific styles from our collection when relevant
- Explain WHY a style works (e.g., "This wrap dress defines your waist beautifully")
- Use positive, empowering language
- Avoid technical fashion jargon

${outfitContext}

Remember: Every body is beautiful! Focus on what makes the user feel amazing, not on "fixing flaws."`,
    };

    // Call ChatGPT
    const aiResponse = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [systemMessage, ...messages],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error("AI request failed");
    }

    const aiData = await aiResponse.json();
    const reply = aiData.choices[0].message.content;

    return Response.json({ reply });
  } catch (error) {
    console.error("Error in AI stylist:", error);
    return Response.json(
      { error: "Sorry, I'm having trouble right now. Please try again!" },
      { status: 500 },
    );
  }
}