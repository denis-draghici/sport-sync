import { anthropic } from "./client"

export interface UserProfile {
  id: string
  name: string
  bio?: string | null
  sports: Array<{ sport: string; skillLevel: string }>
}

export async function scoreCompatibility(
  users: UserProfile[]
): Promise<Record<string, number>> {
  if (users.length <= 1) return {}

  const profiles = users
    .map(
      (u) =>
        `- ${u.name} (${u.id.slice(0, 8)}): Bio: "${u.bio ?? "no bio"}". Sports: ${u.sports.map((s) => `${s.sport}(${s.skillLevel})`).join(", ")}`
    )
    .join("\n")

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `Rate the group compatibility of these sports players (0-100 score each).
Consider: skill level similarity, bio personality match, and sport preferences.

Players:
${profiles}

Return ONLY a JSON object mapping each player ID prefix to their group fit score, e.g.:
{"abc12345": 85, "def67890": 72}
Use only the first 8 chars of each ID as the key.`,
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : "{}"
    const match = text.match(/\{[\s\S]+\}/)
    if (!match) return {}

    return JSON.parse(match[0])
  } catch {
    return {}
  }
}
