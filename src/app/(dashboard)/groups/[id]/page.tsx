import { getAuthUser } from "@/actions/auth"
import { getGroup } from "@/actions/groups"
import { getMessageHistory } from "@/actions/chat"
import { redirect, notFound } from "next/navigation"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SportIcon } from "@/components/shared/SportIcon"
import { Calendar, MapPin, UserPlus, MessageCircle } from "lucide-react"
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
    <div className="mx-auto flex min-h-[calc(100dvh-10rem)] max-w-5xl flex-col gap-4 lg:h-[calc(100dvh-8rem)] lg:min-h-0 lg:flex-row">
      {/* Sidebar info */}
      <div className="order-last grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:order-none lg:block lg:w-72 lg:space-y-4 lg:overflow-y-auto lg:pr-1">
        {/* Group header */}
        <Card className="border-border bg-card/95">
          <CardHeader className="pb-3 max-[360px]:px-4">
            <div className="flex items-center gap-2">
              <SportIcon sport={group.sport} size="md" />
              <CardTitle className="break-words text-base">{SPORT_LABELS[group.sport]} Group</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">{formatDateLabel(group.availDate)}</p>
          </CardHeader>
          <CardContent className="space-y-3 max-[360px]:px-4">
            {group.event?.scheduledAt && (
              <p className="text-sm flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {formatDateLabel(group.event.scheduledAt)}
              </p>
            )}
            {group.event?.venueName && (
              <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="break-words">{group.event.venueName}</span>
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
            <Button size="sm" variant="outline" className="w-full lg:hidden" asChild>
              <Link href={`/groups/${group.id}/chat`}>
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
                Open chat
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Members */}
        <Card className="border-border bg-card/95">
          <CardHeader className="pb-2 max-[360px]:px-4">
            <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider">
              {group.members.length} Players
            </CardTitle>
          </CardHeader>
          <CardContent className="max-[360px]:px-4">
            <GroupMembersLive
              groupId={group.id}
              initialMembers={group.members as any}
              captainId={group.captainId}
              currentUserId={authUser.id}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chat — hidden on mobile, has its own page at /groups/[id]/chat */}
      <Card className="hidden lg:flex order-first h-[calc(100dvh-11rem)] min-h-80 max-h-168 flex-1 flex-col overflow-hidden border-border bg-card/95 shadow-xl shadow-background/20 lg:order-0 lg:h-auto lg:max-h-none lg:min-h-0">
        <CardHeader className="shrink-0 border-b border-border px-3 py-3 sm:px-4 sm:pt-4">
          <CardTitle className="flex flex-wrap items-center gap-2 text-base">
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
