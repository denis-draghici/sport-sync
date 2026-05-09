import { Sport } from "@prisma/client"
import { anthropic } from "./client"
import { SPORT_LIST } from "@/lib/sports"

export async function analyzePhotoForSports(imageUrl: string): Promise<Sport[]> {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "url", url: imageUrl },
            },
            {
              type: "text",
              text: `Look at this profile photo and identify any sports the person might play based on clothing, equipment, or context.
Available sports: ${SPORT_LIST.join(", ")}
Respond ONLY with a JSON array of sport names, e.g. ["FOOTBALL","RUNNING"]. If none are visible, return [].`,
            },
          ],
        },
      ],
    })

    const text = message.content[0].type === "text" ? message.content[0].text : "[]"
    const match = text.match(/\[.*\]/s)
    if (!match) return []

    const parsed: string[] = JSON.parse(match[0])
    return parsed.filter((s): s is Sport => SPORT_LIST.includes(s as Sport))
  } catch {
    return []
  }
}
