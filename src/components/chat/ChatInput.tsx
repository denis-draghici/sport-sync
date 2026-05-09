"use client"

import { useRef, useState, KeyboardEvent } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { SendHorizontal } from "lucide-react"

interface Props {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function resizeTextarea() {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    textarea.style.height = `${Math.min(textarea.scrollHeight, 96)}px`
  }

  async function handleSend() {
    if (!value.trim() || disabled) return
    const content = value.trim()
    setValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
    await onSend(content)
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          resizeTextarea()
        }}
        onKeyDown={handleKey}
        placeholder="Type a message..."
        disabled={disabled}
        rows={1}
        className="max-h-24 min-h-11 min-w-0 flex-1 resize-none py-2.5 leading-5"
      />
      <Button size="icon" className="h-11 w-11 shrink-0" onClick={handleSend} disabled={disabled || !value.trim()}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}
