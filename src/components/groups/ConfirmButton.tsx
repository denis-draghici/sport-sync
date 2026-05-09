"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { confirmParticipation, unconfirmParticipation } from "@/actions/groups"
import { toast } from "sonner"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

interface Props {
  groupId: string
  isConfirmed: boolean
}

export function ConfirmButton({ groupId, isConfirmed }: Props) {
  const [pending, setPending] = useState(false)

  async function handleToggle() {
    setPending(true)
    if (isConfirmed) {
      const result = await unconfirmParticipation(groupId)
      if (result?.success) toast.info("Response updated — not going")
      else toast.error("Failed to update response")
    } else {
      const result = await confirmParticipation(groupId)
      if (result?.success) toast.success("You're confirmed!")
      else toast.error("Failed to confirm")
    }
    setPending(false)
  }

  return (
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
  )
}
