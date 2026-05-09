import { getAuthUser } from "@/actions/auth"
import { getGroup } from "@/actions/groups"
import { getMessageHistory } from "@/actions/chat"
import { redirect, notFound } from "next/navigation"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SportIcon } from "@/components/shared/SportIcon"
import { Calendar, MapPin, UserPlus } from "lucide-react"
import { SPORT_LABELS } from "@/lib/sports"
import { formatDateLabel } from "@/lib/date"
import Link from "next/link"
import type { MessageWithUser } from "@/types"
import { GroupMembersLive } from "@/components/groups/GroupMembersLive"

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  let group
  try {
    group = await getGroup(id)
  } catch {
    notFound()
  }

  const messages = await getMessageHistory(id)
  const isCaptain = group.captainId === authUser.id

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-4">
      {/* Sidebar info */}
      <div className="lg:w-72 shrink-0 space-y-4 overflow-y-auto">
        {/* Group header */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <SportIcon sport={group.sport} size="md" />
              <CardTitle className="text-base">{SPORT_LABELS[group.sport]} Group</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{formatDateLabel(group.availDate)}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {group.event?.scheduledAt && (
              <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateLabel(group.event.scheduledAt)}
              </p>
            )}
            {group.event?.venueName && (
              <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {group.event.venueName}
              </p>
            )}
            {group.event && (
              <Button size="sm" className="w-full" asChild>
                <Link href={`/events/${group.event.id}`}>Manage event</Link>
              </Button>
            )}
            {isCaptain && (
              <Button size="sm" variant="secondary" className="w-full" asChild>
                <Link href={`/players?invite=${group.id}`}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Invite players
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              {group.members.length} Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GroupMembersLive
              groupId={group.id}
              initialMembers={group.members as any}
              captainId={group.captainId}
              currentUserId={authUser.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chat */}
      <Card className="flex-1 border-border bg-card flex flex-col min-h-0">
        <CardHeader className="border-b border-border pb-3 pt-4 px-4 shrink-0">
          <CardTitle className="text-base flex items-center gap-2">
            Group Chat
            {isCaptain && <Badge variant="secondary" className="text-xs text-primary">Captain</Badge>}
          </CardTitle>
        </CardHeader>
        <div className="flex-1 min-h-0">
          <ChatWindow
            groupId={group.id}
            initialMessages={messages as unknown as MessageWithUser[]}
            currentUserId={authUser.id}
          />
        </div>
      </Card>
    </div>
  )
}
