"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Event, Group, User, GroupMember } from "@prisma/client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SportIcon } from "@/components/shared/SportIcon"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { EmptyState } from "@/components/shared/EmptyState"
import { Crown, MapPin, CalendarDays, Loader2 } from "lucide-react"
import { SPORT_LABELS } from "@/lib/sports"
import { formatDateTime } from "@/lib/date"
import { joinEvent } from "@/actions/events"
import { toast } from "sonner"
import Link from "next/link"

type EventWithGroup = Event & {
  group: Group & {
    members: (GroupMember & { user: User })[]
    captain: User
  }
}

function EventCard({ event, currentUserId }: { event: EventWithGroup; currentUserId: string }) {
  const isCaptain = event.group.captainId === currentUserId

  return (
    <Card className="border-border bg-card/95 transition-colors hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="pt-4 pb-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <SportIcon sport={event.sport} size="md" />
            <div className="min-w-0">
              <p className="font-semibold">{SPORT_LABELS[event.sport]}</p>
              {event.scheduledAt ? (
                <p className="text-xs text-muted-foreground">{formatDateTime(event.scheduledAt)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Date TBD</p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">
            {isCaptain && (
              <Badge variant="secondary" className="text-xs text-primary border-primary/30 gap-1">
                <Crown className="h-3 w-3" /> Captain
              </Badge>
            )}
            <Badge variant="outline" className="text-xs capitalize">{event.status.toLowerCase()}</Badge>
          </div>
        </div>

        {event.venueName && (
          <p className="mb-3 flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> <span className="break-words">{event.venueName}
            {event.venueAddress && ` · ${event.venueAddress}`}
            </span>
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

function AvailableEventCard({ event, onJoined }: { event: EventWithGroup; onJoined: () => void }) {
  const [joining, setJoining] = useState(false)
  const router = useRouter()

  async function handleJoin() {
    setJoining(true)
    const result = await joinEvent(event.id)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("You joined the event!")
      onJoined()
      router.refresh()
    }
    setJoining(false)
  }

  return (
    <Card className="border-border bg-card/95 transition-colors hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="pt-4 pb-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <SportIcon sport={event.sport} size="md" />
            <div className="min-w-0">
              <p className="font-semibold">{SPORT_LABELS[event.sport]}</p>
              {event.scheduledAt ? (
                <p className="text-xs text-muted-foreground">{formatDateTime(event.scheduledAt)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Date TBD</p>
              )}
            </div>
          </div>
          <Badge variant="outline" className="text-xs capitalize shrink-0">{event.status.toLowerCase()}</Badge>
        </div>

        {event.venueName && (
          <p className="mb-3 flex items-start gap-1 text-xs text-muted-foreground">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0" /> <span className="break-words">{event.venueName}
            {event.venueAddress && ` · ${event.venueAddress}`}
            </span>
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            {event.group.members.slice(0, 5).map((m) => (
              <UserAvatar key={m.userId} name={m.user.name} avatarUrl={m.user.avatarUrl} size="sm" />
            ))}
            {event.group.members.length > 5 && (
              <span className="text-xs text-muted-foreground">+{event.group.members.length - 5}</span>
            )}
            <span className="ml-1 truncate text-xs text-muted-foreground">
              by {event.group.captain.name}
            </span>
          </div>
        </div>

        {event.notes && (
          <p className="text-xs text-muted-foreground mt-2 border-t border-border pt-2 line-clamp-2">{event.notes}</p>
        )}

        <Button size="sm" className="w-full mt-3" onClick={handleJoin} disabled={joining}>
          {joining ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : "✅ "}
          Join event
        </Button>
      </CardContent>
    </Card>
  )
}

interface Props {
  myEvents: EventWithGroup[]
  availableEvents: EventWithGroup[]
  currentUserId: string
}

export function EventsClient({ myEvents, availableEvents: initialAvailable, currentUserId }: Props) {
  const [availableEvents, setAvailableEvents] = useState(initialAvailable)

  function handleJoined(eventId: string) {
    setAvailableEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  return (
    <Tabs defaultValue="upcoming">
      <TabsList className="mb-4 h-auto w-full gap-1 p-1">
        <TabsTrigger value="upcoming" className="min-h-9 flex-1 px-2">
          Upcoming {myEvents.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">{myEvents.length}</Badge>}
        </TabsTrigger>
        <TabsTrigger value="available" className="min-h-9 flex-1 px-2">
          Available {availableEvents.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">{availableEvents.length}</Badge>}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="space-y-3 mt-0">
        {myEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No upcoming events"
            description="Join an available event or create your own."
          />
        ) : (
          myEvents.map((event) => (
            <EventCard key={event.id} event={event} currentUserId={currentUserId} />
          ))
        )}
      </TabsContent>

      <TabsContent value="available" className="space-y-3 mt-0">
        {availableEvents.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No available events"
            description="Create your own event and others will be able to join."
          />
        ) : (
          availableEvents.map((event) => (
            <AvailableEventCard
              key={event.id}
              event={event}
              onJoined={() => handleJoined(event.id)}
            />
          ))
        )}
      </TabsContent>
    </Tabs>
  )
}
