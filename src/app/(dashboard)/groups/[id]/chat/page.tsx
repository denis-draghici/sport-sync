import { getAuthUser } from "@/actions/auth"
import { getGroup } from "@/actions/groups"
import { getMessageHistory } from "@/actions/chat"
import { redirect, notFound } from "next/navigation"
import { ChatWindow } from "@/components/chat/ChatWindow"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { SPORT_LABELS } from "@/lib/sports"
import Link from "next/link"
import type { MessageWithUser } from "@/types"

export default async function GroupChatPage({ params }: { params: Promise<{ id: string }> }) {
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

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-3 py-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
          <Link href={`/groups/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{SPORT_LABELS[group.sport]} Group</p>
          <p className="text-xs text-muted-foreground">{group.members.length} members</p>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ChatWindow
          groupId={group.id}
          initialMessages={messages as unknown as MessageWithUser[]}
          currentUserId={authUser.id}
        />
      </div>
    </div>
  )
}
