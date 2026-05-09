"use client"

import { useState, KeyboardEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

interface Props {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("")

  async function handleSend() {
    if (!value.trim() || disabled) return
    const content = value.trim()
    setValue("")
    await onSend(content)
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1"
      />
      <Button size="icon" onClick={handleSend} disabled={disabled || !value.trim()}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
