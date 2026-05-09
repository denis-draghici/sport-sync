"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { sendMessage } from "@/actions/chat"
import { MessageBubble } from "./MessageBubble"
import { ChatInput } from "./ChatInput"
import { toast } from "sonner"
import type { MessageWithUser } from "@/types"

interface Props {
  groupId: string
  initialMessages: MessageWithUser[]
  currentUserId: string
}

export function ChatWindow({ groupId, initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<MessageWithUser[]>(initialMessages)
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabaseRef = useRef(createClient())
  const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const supabase = supabaseRef.current
    const channel = supabase
      .channel(`group-chat-${groupId}`, { config: { broadcast: { self: false } } })
      .on("broadcast", { event: "new-message" }, ({ payload }) => {
        const msg = payload as MessageWithUser
        setMessages((prev) =>
          prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
        )
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [groupId])

  async function handleSend(content: string) {
    setSending(true)
    const result = await sendMessage(groupId, content)
    if (result?.error) {
      toast.error(result.error)
    } else if (result?.message) {
      const msg = result.message as MessageWithUser
      setMessages((prev) =>
        prev.find((m) => m.id === msg.id) ? prev : [...prev, msg]
      )
      channelRef.current?.send({
        type: "broadcast",
        event: "new-message",
        payload: msg,
      })
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-1 p-4 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No messages yet. Say hello! 👋
          </p>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isOwn={msg.userId === currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="border-t border-border p-3">
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  )
}
