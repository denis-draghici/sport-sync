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
    <Card className="border-border bg-card hover:border-primary/30 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <SportIcon sport={group.sport} size="md" />
            <div>
              <p className="font-semibold">{SPORT_LABELS[group.sport]}</p>
              <p className="text-xs text-muted-foreground">{formatDateLabel(group.availDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <Calendar className="h-3 w-3" />
            {formatDateLabel(group.event.scheduledAt)}
            {group.event.venueName && ` · ${group.event.venueName}`}
          </p>
        )}

        <div className="flex gap-2">
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
