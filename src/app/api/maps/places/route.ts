import { NextRequest, NextResponse } from "next/server"
import { searchVenuesNearby } from "@/lib/maps/places"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sport = searchParams.get("sport")
  const lat = parseFloat(searchParams.get("lat") ?? "0")
  const lng = parseFloat(searchParams.get("lng") ?? "0")
  const radius = parseInt(searchParams.get("radius") ?? "5000")

  if (!sport || !lat || !lng) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
  }

  const results = await searchVenuesNearby(sport, lat, lng, radius)
  return NextResponse.json({ results })
}
