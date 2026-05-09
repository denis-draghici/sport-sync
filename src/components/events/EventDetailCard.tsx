"use client"

import { useState } from "react"
import { Event, Group, User, GroupMember, SportPreference } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { SportIcon } from "@/components/shared/SportIcon"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { Crown, MapPin, Calendar, Edit2, Check, Users } from "lucide-react"
import { SPORT_LABELS, VENUE_PRICE_RANGES } from "@/lib/sports"
import { formatDateTime } from "@/lib/date"
import { updateEvent } from "@/actions/events"
import { toast } from "sonner"
import { DateTimePicker } from "@/components/ui/date-time-picker"

type EventWithGroup = Event & {
  group: Group & {
    members: (GroupMember & { user: User & { sportPreferences: SportPreference[] } })[]
    captain: User
  }
}

export function EventDetailCard({
  event,
  currentUserId,
  isCaptain,
}: {
  event: EventWithGroup
  currentUserId: string
  isCaptain: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [venueName, setVenueName] = useState(event.venueName ?? "")
  const [venueAddress, setVenueAddress] = useState(event.venueAddress ?? "")
  const [scheduledAt, setScheduledAt] = useState(
    event.scheduledAt ? new Date(event.scheduledAt).toISOString().slice(0, 16) : ""
  )
  const [notes, setNotes] = useState(event.notes ?? "")
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const fd = new FormData()
    if (venueName) fd.set("venueName", venueName)
    if (venueAddress) fd.set("venueAddress", venueAddress)
    if (scheduledAt) fd.set("scheduledAt", scheduledAt)
    if (notes) fd.set("notes", notes)
    const result = await updateEvent(event.id, fd)
    if (result?.error) toast.error(result.error)
    else { toast.success("Event updated!"); setEditing(false) }
    setSaving(false)
  }

  const confirmedCount = event.group.members.filter((m: GroupMember) => m.confirmedAt).length

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SportIcon sport={event.sport} size="md" />
            <CardTitle className="text-base">{SPORT_LABELS[event.sport]}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs capitalize">{event.status.toLowerCase()}</Badge>
            {isCaptain && !editing && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Venue</label>
              <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Venue name" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Address</label>
              <Input value={venueAddress} onChange={(e) => setVenueAddress(e.target.value)} placeholder="Full address" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date & Time</label>
              <DateTimePicker value={scheduledAt} onChange={setScheduledAt} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Notes</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any info for the team..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Check className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {event.scheduledAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDateTime(event.scheduledAt)}</span>
              </div>
            )}
            {event.venueName && (
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{event.venueName}</p>
                  {event.venueAddress && <p className="text-muted-foreground text-xs">{event.venueAddress}</p>}
                </div>
              </div>
            )}
            {!event.venueName && isCaptain && (
              <p className="text-sm text-muted-foreground italic">No venue set yet. Edit to add one.</p>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{event.group.members.length} players · {confirmedCount} confirmed</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Crown className="h-3.5 w-3.5 text-primary" />
              <span>Captain: {event.group.captain.name}</span>
            </div>
            <div className="text-xs text-muted-foreground bg-secondary/50 rounded-md px-3 py-2">
              Estimated venue cost: <span className="text-foreground font-medium">{VENUE_PRICE_RANGES[event.sport]}</span>
            </div>
            {event.notes && (
              <p className="text-sm text-muted-foreground border-t border-border pt-2">{event.notes}</p>
            )}
          </div>
        )}

        {/* Member list */}
        <div className="border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground mb-2">PLAYERS</p>
          <div className="grid grid-cols-2 gap-2">
            {event.group.members.map((m: GroupMember & { user: User }) => (
              <div key={m.userId} className="flex items-center gap-2">
                <UserAvatar name={m.user.name} avatarUrl={m.user.avatarUrl} size="sm" />
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{m.user.name}</p>
                  {m.confirmedAt && <p className="text-xs text-primary">✓</p>}
                  {m.userId === event.group.captainId && <Crown className="h-2.5 w-2.5 text-primary inline" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
