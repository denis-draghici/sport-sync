import Link from "next/link"
import { Group, GroupMember, User, SportPreference, Event } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SportIcon } from "@/components/shared/SportIcon"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { Crown, MessageCircle, Calendar } from "lucide-react"
import { SPORT_LABELS } from "@/lib/sports"
import { formatDateLabel } from "@/lib/date"

type GroupWithDetails = Group & {
  members: (GroupMember & { user: User & { sportPreferences: SportPreference[] } })[]
  event: Event | null
  captain: User
}

export function MatchCard({ group, currentUserId }: { group: GroupWithDetails; currentUserId: string }) {
  const isCaptain = group.captainId === currentUserId
  const memberCount = group.members.length

  return (
    <Card className="border-border bg-card/95 transition-colors hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="pt-4 pb-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <SportIcon sport={group.sport} size="md" />
            <div className="min-w-0">
              <p className="font-semibold">{SPORT_LABELS[group.sport]}</p>
              <p className="text-xs text-muted-foreground">{formatDateLabel(group.availDate)}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
            {isCaptain && (
              <Badge variant="secondary" className="text-xs text-primary border-primary/30 gap-1">
                <Crown className="h-3 w-3" /> Captain
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">{memberCount} players</Badge>
          </div>
        </div>

        {/* Members */}
        <div className="flex items-center gap-1.5 mb-3">
          {group.members.slice(0, 6).map((m) => (
            <UserAvatar key={m.userId} name={m.user.name} avatarUrl={m.user.avatarUrl} size="sm" />
          ))}
          {memberCount > 6 && (
            <span className="text-xs text-muted-foreground ml-1">+{memberCount - 6} more</span>
          )}
        </div>

        {/* Event info */}
        {group.event?.scheduledAt && (
          <p className="mb-3 flex items-start gap-1 text-xs text-muted-foreground">
            <Calendar className="mt-0.5 h-3 w-3 shrink-0" />
            <span className="break-words">
              {formatDateLabel(group.event.scheduledAt)}
              {group.event.venueName && ` · ${group.event.venueName}`}
            </span>
          </p>
        )}

        <div className="flex flex-col gap-2 min-[420px]:flex-row">
          <Button size="sm" variant="outline" className="flex-1 gap-2" asChild>
            <Link href={`/groups/${group.id}`}>
              <MessageCircle className="h-3.5 w-3.5" /> Open chat
            </Link>
          </Button>
          {group.event && (
            <Button size="sm" className="flex-1" asChild>
              <Link href={`/events/${group.event.id}`}>View event</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
