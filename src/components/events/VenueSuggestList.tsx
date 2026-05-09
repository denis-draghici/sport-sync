"use client"

import { useState } from "react"
import { Sport } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createPoll } from "@/actions/polls"
import { toast } from "sonner"
import { Sparkles, MapPin, Vote } from "lucide-react"
import type { VenueRecommendation } from "@/lib/ai/venue-recommender"

interface Props {
  recommendations: VenueRecommendation[]
  eventId: string
  sport: Sport
  lat?: number | null
  lng?: number | null
}

export function VenueSuggestList({ recommendations, eventId, sport, lat, lng }: Props) {
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState(false)

  async function handleCreatePoll() {
    setCreating(true)
    const result = await createPoll(
      eventId,
      "Which venue do you prefer?",
      recommendations.map((r) => ({
        label: r.venueType,
        venueData: { venueType: r.venueType, searchQuery: r.searchQuery, tips: r.tips },
      }))
    )
    if (result?.error) toast.error(result.error)
    else { toast.success("Poll created! Members can now vote."); setCreated(true) }
    setCreating(false)
  }

  return (
    <Card className="border-border bg-card border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" /> AI Venue Recommendations
        </CardTitle>
        <p className="text-xs text-muted-foreground">Suggested venue types for your group</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((r, i) => (
          <div key={i} className="border border-border rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-sm font-medium">{r.venueType}</span>
            </div>
            <p className="text-xs text-muted-foreground pl-5">{r.tips}</p>
            <p className="text-xs text-muted-foreground/60 pl-5 italic">{r.searchQuery}</p>
          </div>
        ))}
        {!created ? (
          <Button size="sm" variant="outline" className="w-full gap-2" onClick={handleCreatePoll} disabled={creating}>
            <Vote className="h-3.5 w-3.5" />
            {creating ? "Creating poll..." : "Create venue vote poll"}
          </Button>
        ) : (
          <Badge variant="secondary" className="text-xs text-primary w-full justify-center py-1">
            ✓ Poll created — scroll down to see it
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
