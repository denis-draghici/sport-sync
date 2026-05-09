import Link from "next/link"
import { Event, Group, User, GroupMember } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SportIcon } from "@/components/shared/SportIcon"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { Crown, MapPin, Calendar } from "lucide-react"
import { SPORT_LABELS } from "@/lib/sports"
import { formatDateTime } from "@/lib/date"

type EventWithGroup = Event & {
  group: Group & {
    members: (GroupMember & { user: User })[]
    captain: User
  }
}

export function EventCard({ event, currentUserId }: { event: EventWithGroup; currentUserId: string }) {
  const isCaptain = event.group.captainId === currentUserId

  return (
    <Card className="border-border bg-card hover:border-primary/30 transition-colors">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <SportIcon sport={event.sport} size="md" />
            <div>
              <p className="font-semibold">{SPORT_LABELS[event.sport]}</p>
              {event.scheduledAt ? (
                <p className="text-xs text-muted-foreground">{formatDateTime(event.scheduledAt)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Date TBD</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isCaptain && (
              <Badge variant="secondary" className="text-xs text-primary border-primary/30 gap-1">
                <Crown className="h-3 w-3" /> Captain
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">{event.status.toLowerCase()}</Badge>
          </div>
        </div>

        {event.venueName && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3 w-3" /> {event.venueName}
            {event.venueAddress && ` · ${event.venueAddress}`}
          </p>
        )}

        <div className="flex items-center gap-1.5 mb-3">
          {event.group.members.slice(0, 5).map((m) => (
            <UserAvatar key={m.userId} name={m.user.name} avatarUrl={m.user.avatarUrl} size="sm" />
          ))}
          {event.group.members.length > 5 && (
            <span className="text-xs text-muted-foreground">+{event.group.members.length - 5}</span>
          )}
        </div>

        <Button size="sm" className="w-full" asChild>
          <Link href={`/events/${event.id}`}>View event</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
