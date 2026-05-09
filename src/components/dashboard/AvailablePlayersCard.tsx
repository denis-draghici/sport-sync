"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sport } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { createManualGroup } from "@/actions/players"
import { toast } from "sonner"
import { SPORT_EMOJIS, SPORT_LABELS } from "@/lib/sports"
import { MapPin, UserPlus, Loader2 } from "lucide-react"

type AvailablePlayer = {
  id: string
  name: string
  avatarUrl: string | null
  location: string | null
  availableSports: Sport[]
}

interface Props {
  players: AvailablePlayer[]
  loading: boolean
}

export function AvailablePlayersCard({ players, loading }: Props) {
  const router = useRouter()
  const [inviting, setInviting] = useState<string | null>(null)
  const [sportPick, setSportPick] = useState<Record<string, Sport>>({})

  function getSportForPlayer(player: AvailablePlayer): Sport {
    return sportPick[player.id] ?? player.availableSports[0]
  }

  async function handleInvite(player: AvailablePlayer) {
    const sport = getSportForPlayer(player)
    setInviting(player.id)
    const result = await createManualGroup(sport, [player.id])
    if (result?.error) {
      toast.info(result.error)
      if (result.groupId) router.push(`/groups/${result.groupId}`)
    } else if (result?.success) {
      toast.success(`Group created with ${player.name}!`)
      router.push(`/groups/${result.groupId}`)
    } else {
      toast.error("Failed to create group")
    }
    setInviting(null)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <span className="text-lg">👥</span> Players Available Today
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Finding players...
          </div>
        ) : players.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            No other players available yet — check back soon!
          </p>
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center gap-3">
                <UserAvatar name={player.name} avatarUrl={player.avatarUrl} size="md" />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{player.name}</p>
                  {player.location && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {player.location}
                    </p>
                  )}
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {player.availableSports.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {SPORT_EMOJIS[s]} {SPORT_LABELS[s]}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  {player.availableSports.length > 1 && (
                    <Select
                      value={getSportForPlayer(player)}
                      onValueChange={(v) => setSportPick((prev) => ({ ...prev, [player.id]: v as Sport }))}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {player.availableSports.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {SPORT_EMOJIS[s]} {SPORT_LABELS[s]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    size="sm"
                    onClick={() => handleInvite(player)}
                    disabled={inviting === player.id}
                    className="h-7 text-xs"
                  >
                    {inviting === player.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <UserPlus className="h-3 w-3 mr-1" />
                    )}
                    Invite
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
