export interface PlaceResult {
  place_id: string
  name: string
  vicinity: string
  formatted_address?: string
  geometry: {
    location: { lat: number; lng: number }
  }
  rating?: number
  user_ratings_total?: number
  opening_hours?: { open_now?: boolean }
  photos?: Array<{ photo_reference: string }>
  price_level?: number
}

const SPORT_KEYWORDS: Record<string, string> = {
  FOOTBALL: "football pitch|soccer field",
  TENNIS: "tennis court",
  BASKETBALL: "basketball court",
  VOLLEYBALL: "volleyball court",
  RUNNING: "running track|park",
  CYCLING: "cycling path|velodrome",
}

export async function searchVenuesNearby(
  sport: string,
  lat: number,
  lng: number,
  radius = 5000
): Promise<PlaceResult[]> {
  const keyword = SPORT_KEYWORDS[sport] ?? "sports facility"
  const url = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json")
  url.searchParams.set("location", `${lat},${lng}`)
  url.searchParams.set("radius", String(radius))
  url.searchParams.set("keyword", keyword)
  url.searchParams.set("type", "stadium|gym|park|sports_complex")
  url.searchParams.set("key", process.env.GOOGLE_PLACES_API_KEY!)

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return []

  const data = await res.json()
  return (data.results ?? []).slice(0, 6) as PlaceResult[]
}
