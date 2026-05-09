import { getModel } from "./client"
import { SPORT_LABELS } from "@/lib/sports"
import { Sport } from "@prisma/client"

export interface VenueRecommendation {
  venueType: string
  searchQuery: string
  tips: string
}

export async function recommendVenues(
  sport: Sport,
  groupSize: number,
  location: string
): Promise<VenueRecommendation[]> {
  try {
    const model = getModel()
    const result = await model.generateContent(
      `Suggest 3 venue types for a ${SPORT_LABELS[sport]} game with ${groupSize} players near ${location}.
Return ONLY a JSON array of objects with keys: "venueType", "searchQuery" (for Google Places), "tips".
Example: [{"venueType":"Indoor Sports Hall","searchQuery":"indoor sports hall near ${location}","tips":"Book in advance on weekends"}]`
    )

    const text = result.response.text()
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) return []

    return JSON.parse(match[0])
  } catch {
    return []
  }
}
