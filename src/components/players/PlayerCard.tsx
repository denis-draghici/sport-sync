"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { SportIcon } from "@/components/shared/SportIcon"
import { SKILL_LEVEL_LABELS, SKILL_LEVEL_COLORS, SPORT_LABELS, SPORT_LIST } from "@/lib/sports"
import { inviteToGroup, createManualGroup } from "@/actions/players"
import { Sport, SkillLevel } from "@prisma/client"
import { UserPlus, Users, MapPin, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface Player {
  id: string
  name: string
  avatarUrl: string | null
  bio: string | null
  location: string | null
  sportPreferences: { sport: Sport; skillLevel: SkillLevel }[]
}

interface CaptainGroup {
  id: string
  sport: Sport
  members: { userId: string }[]
}

interface Props {
  player: Player
  captainGroups: CaptainGroup[]
  currentUserId: string
  defaultInviteGroupId?: string
}

export function PlayerCard({ player, captainGroups, defaultInviteGroupId }: Props) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [creatingFor, setCreatingFor] = useState<Sport | null>(null)

  function handleInvite(groupId: string) {
    startTransition(async () => {
      const res = await inviteToGroup(groupId, player.id)
      if ("error" in res) {
        toast.error(res.error)
      } else {
        toast.success(`${player.name} invited!`)
        router.refresh()
      }
    })
  }

  function handleCreate(sport: Sport) {
    setCreatingFor(sport)
    startTransition(async () => {
      const res = await createManualGroup(sport, [player.id])
      setCreatingFor(null)
      if ("error" in res) {
        toast.error(res.error as string)
      } else {
        toast.success("Group created!")
        router.push(`/groups/${res.groupId}`)
      }
    })
  }

  const groupsNotContainingPlayer = captainGroups.filter(
    (g) => !g.members.some((m) => m.userId === player.id)
  )

  // If arrived via "Invite players" from a group page, auto-trigger invite on click
  const defaultGroup = defaultInviteGroupId
    ? groupsNotContainingPlayer.find((g) => g.id === defaultInviteGroupId)
    : undefined

  return (
    <Card className="h-full border-border bg-card/95 transition-colors hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="flex h-full flex-col space-y-3 p-4">
        <div className="flex items-start gap-3">
          <UserAvatar name={player.name} avatarUrl={player.avatarUrl} size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{player.name}</p>
            {player.location && (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{player.location}</span>
              </p>
            )}
          </div>
        </div>

        {player.bio && (
          <p className="text-xs text-muted-foreground line-clamp-2">{player.bio}</p>
        )}

        {player.sportPreferences.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {player.sportPreferences.map((pref) => (
              <span key={pref.sport} className="flex items-center gap-1">
                <SportIcon sport={pref.sport} size="sm" />
                <Badge
                  variant="secondary"
                  className={`text-xs ${SKILL_LEVEL_COLORS[pref.skillLevel]}`}
                >
                  {SKILL_LEVEL_LABELS[pref.skillLevel]}
                </Badge>
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-1 min-[420px]:flex-row">
          {/* Quick invite when coming from a group page */}
          {defaultGroup && (
            <Button
              size="sm"
              variant="default"
              className="flex-1 gap-1"
              onClick={() => handleInvite(defaultGroup.id)}
            >
              <UserPlus className="h-3.5 w-3.5" />
              Invite to group
            </Button>
          )}

          {/* Invite to existing group */}
          {!defaultGroup && groupsNotContainingPlayer.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="secondary" className="flex-1 gap-1">
                  <Users className="h-3.5 w-3.5" />
                  Add to group
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Your forming groups</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {groupsNotContainingPlayer.map((g) => (
                  <DropdownMenuItem key={g.id} onClick={() => handleInvite(g.id)}>
                    <SportIcon sport={g.sport} size="sm" />
                    <span className="ml-1.5">{SPORT_LABELS[g.sport]} group</span>
                    <span className="ml-auto text-xs text-muted-foreground">{g.members.length} members</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Create new group with this player — hide if quick-invite mode */}
          {!defaultGroup && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="default" className="flex-1 gap-1">
                  <UserPlus className="h-3.5 w-3.5" />
                  New group
                  <ChevronDown className="h-3 w-3 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs text-muted-foreground">Pick a sport</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(player.sportPreferences.length > 0
                  ? player.sportPreferences.map((p) => p.sport)
                  : SPORT_LIST
                ).map((sport) => (
                  <DropdownMenuItem
                    key={sport}
                    disabled={creatingFor === sport}
                    onClick={() => handleCreate(sport)}
                  >
                    <SportIcon sport={sport} size="sm" />
                    <span className="ml-1.5">{SPORT_LABELS[sport]}</span>
                    {creatingFor === sport && <span className="ml-auto text-xs">Creating…</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
