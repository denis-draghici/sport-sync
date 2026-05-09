import { Sport } from "@prisma/client"
import { anthropic } from "./client"
import { SPORT_LIST } from "@/lib/sports"

export async function parseBioForSports(bio: string): Promise<Sport[]> {
  if (!bio || bio.trim().length < 10) return []

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `Given this user bio, identify which sports from the following list they likely enjoy.
Bio: "${bio}"
Available sports: ${SPORT_LIST.join(", ")}
Respond ONLY with a valid JSON array of sport names from the list, e.g. ["FOOTBALL","RUNNING"]. If none match, return [].`,
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : "[]"
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []

    const parsed: string[] = JSON.parse(match[0])
    return parsed.filter((s): s is Sport => SPORT_LIST.includes(s as Sport))
  } catch {
    return []
  }
}
