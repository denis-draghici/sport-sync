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
  const supabase = createClient()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageWithUser
          // Only add if not already present (avoid duplicate from own sends)
          setMessages((prev) =>
            prev.find((m) => m.id === newMsg.id) ? prev : [...prev, newMsg]
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [groupId, supabase])

  async function handleSend(content: string) {
    setSending(true)
    const result = await sendMessage(groupId, content)
    if (result?.error) toast.error(result.error)
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
