"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { confirmParticipation, unconfirmParticipation } from "@/actions/groups"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { Button } from "@/components/ui/button"
import { Crown, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { GroupMember, User } from "@prisma/client"

type MemberWithUser = GroupMember & { user: User }
type ConfirmBroadcast = { userId: string; confirmedAt: string | null }

interface Props {
  groupId: string
  initialMembers: MemberWithUser[]
  captainId: string
  currentUserId: string
}

export function GroupMembersLive({ groupId, initialMembers, captainId, currentUserId }: Props) {
  const [members, setMembers] = useState<MemberWithUser[]>(initialMembers)
  const [pending, setPending] = useState(false)
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null)

  useEffect(() => {
    const supabase = supabaseRef.current
    const channel = supabase
      .channel(`group-members-${groupId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "confirm-update" }, ({ payload }) => {
        const { userId, confirmedAt } = payload as ConfirmBroadcast
        setMembers((prev) =>
          prev.map((m) =>
            m.userId === userId
              ? { ...m, confirmedAt: confirmedAt ? new Date(confirmedAt) : null }
              : m
          )
        )
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [groupId])

  const currentMember = members.find((m) => m.userId === currentUserId)
  const isConfirmed = !!currentMember?.confirmedAt

  async function handleToggle() {
    setPending(true)
    const confirmedAt = isConfirmed ? null : new Date().toISOString()

    // Optimistic update for self
    setMembers((prev) =>
      prev.map((m) =>
        m.userId === currentUserId
          ? { ...m, confirmedAt: confirmedAt ? new Date(confirmedAt) : null }
          : m
      )
    )

    const result = isConfirmed
      ? await unconfirmParticipation(groupId)
      : await confirmParticipation(groupId)

    if (result?.success) {
      if (isConfirmed) toast.info("Response updated — not going")
      else toast.success("You're confirmed!")
      channelRef.current?.send({
        type: "broadcast",
        event: "confirm-update",
        payload: { userId: currentUserId, confirmedAt } satisfies ConfirmBroadcast,
      })
    } else {
      // Revert optimistic update
      setMembers((prev) =>
        prev.map((m) =>
          m.userId === currentUserId
            ? { ...m, confirmedAt: isConfirmed ? currentMember!.confirmedAt : null }
            : m
        )
      )
      toast.error("Failed to update response")
    }

    setPending(false)
  }

  return (
    <>
      <div className="space-y-2.5">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center gap-2.5">
            <UserAvatar name={m.user.name} avatarUrl={m.user.avatarUrl} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{m.user.name}</p>
              {m.confirmedAt && <p className="text-xs text-primary">✓ Confirmed</p>}
            </div>
            {m.userId === captainId && (
              <Crown className="h-3.5 w-3.5 text-primary shrink-0" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-3">
        <Button
          size="sm"
          variant={isConfirmed ? "secondary" : "outline"}
          className="w-full gap-2"
          onClick={handleToggle}
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isConfirmed ? (
            <XCircle className="h-3.5 w-3.5" />
          ) : (
            <CheckCircle className="h-3.5 w-3.5" />
          )}
          {isConfirmed ? "Cancel confirmation" : "Confirm I'm coming"}
        </Button>
      </div>
    </>
  )
}
