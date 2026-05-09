import { Sport } from "@prisma/client"
import { getModel } from "./client"
import { SPORT_LIST } from "@/lib/sports"

export async function analyzePhotoForSports(imageUrl: string): Promise<Sport[]> {
  try {
    const res = await fetch(imageUrl)
    if (!res.ok) return []
    const buffer = await res.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const mimeType = res.headers.get("content-type") ?? "image/jpeg"

    const model = getModel("gemini-2.0-flash")
    const result = await model.generateContent([
      {
        inlineData: { data: base64, mimeType },
      },
      `Look at this profile photo and identify any sports the person might play based on clothing, equipment, or context.
Available sports: ${SPORT_LIST.join(", ")}
Respond ONLY with a JSON array of sport names, e.g. ["FOOTBALL","RUNNING"]. If none are visible, return [].`,
    ])

    const text = result.response.text()
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []

    const parsed: string[] = JSON.parse(match[0])
    return parsed.filter((s): s is Sport => SPORT_LIST.includes(s as Sport))
  } catch {
    return []
  }
}
