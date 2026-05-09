"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sport, Availability } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { setAvailability, getAvailablePlayersForSports } from "@/actions/availability"
import { toast } from "sonner"
import { SPORT_LIST, SPORT_LABELS, SPORT_EMOJIS } from "@/lib/sports"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type AvailablePlayer = { id: string; name: string; avatarUrl: string | null; location: string | null; availableSports: Sport[] }

interface Props {
  todayAvailability: Availability | null
  userSports: Sport[]
  onPlayersLoaded: (players: AvailablePlayer[], loading: boolean) => void
}

export function AvailabilityPrompt({ todayAvailability, userSports, onPlayersLoaded }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [availability, setAvailabilityState] = useState(todayAvailability)
  const [selectedSports, setSelectedSports] = useState<Sport[]>(
    todayAvailability?.sports ?? userSports.slice(0, 3)
  )

  const availableSports = userSports.length > 0 ? userSports : SPORT_LIST

  async function fetchPlayers(sports: Sport[]) {
    onPlayersLoaded([], true)
    const players = await getAvailablePlayersForSports(sports)
    onPlayersLoaded(players as AvailablePlayer[], false)
  }

  useEffect(() => {
    if (todayAvailability?.isAvailable && todayAvailability.sports.length > 0) {
      fetchPlayers(todayAvailability.sports as Sport[])
    }
  }, [])

  function toggleSport(sport: Sport) {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  async function respond(isAvailable: boolean) {
    if (isAvailable && selectedSports.length === 0) {
      toast.error("Select at least one sport")
      return
    }
    setPending(true)
    const result = await setAvailability(isAvailable, isAvailable ? selectedSports : [])
    if (result?.success) {
      setAvailabilityState(result.availability as Availability)
      toast.success(
        isAvailable ? "You're in! Finding your match..." : "Got it — see you next time!"
      )
      if (isAvailable) {
        fetchPlayers(selectedSports)
        setTimeout(() => router.refresh(), 3000)
        setTimeout(() => router.refresh(), 7000)
      } else {
        onPlayersLoaded([], false)
      }
    } else {
      toast.error("Something went wrong")
    }
    setPending(false)
  }

  if (availability) {
    return (
      <Card className={cn("border-2", availability.isAvailable ? "border-primary/40 bg-primary/5" : "border-border bg-card")}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {availability.isAvailable ? (
              <CheckCircle2 className="h-8 w-8 text-primary shrink-0" />
            ) : (
              <XCircle className="h-8 w-8 text-muted-foreground shrink-0" />
            )}
            <div>
              <p className="font-semibold text-lg">
                {availability.isAvailable ? "You're available today!" : "Not available today"}
              </p>
              {availability.isAvailable && availability.sports.length > 0 && (
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {availability.sports.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {SPORT_EMOJIS[s]} {SPORT_LABELS[s]}
                    </Badge>
                  ))}
                </div>
              )}
              {availability.isAvailable && (
                <p className="text-sm text-muted-foreground mt-1">We're finding compatible players for you...</p>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setAvailabilityState(null)}
          >
            Change response
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-primary/30 bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <span className="text-2xl">🏃</span> ShowUpToday?
        </CardTitle>
        <p className="text-muted-foreground text-sm">Are you available to play sports today?</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium mb-2">Which sports?</p>
          <div className="flex flex-wrap gap-2">
            {availableSports.map((sport) => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors",
                  selectedSports.includes(sport)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                )}
              >
                {SPORT_EMOJIS[sport]} {SPORT_LABELS[sport]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            className="flex-1"
            onClick={() => respond(true)}
            disabled={pending || selectedSports.length === 0}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "✅"}
            Yes, I'm in!
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => respond(false)}
            disabled={pending}
          >
            ❌ Not today
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
