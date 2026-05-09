"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { confirmParticipation } from "@/actions/groups"
import { toast } from "sonner"
import { CheckCircle, Loader2 } from "lucide-react"

export function ConfirmButton({ groupId }: { groupId: string }) {
  const [pending, setPending] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  async function handleConfirm() {
    setPending(true)
    const result = await confirmParticipation(groupId)
    if (result?.success) {
      toast.success("You're confirmed!")
      setConfirmed(true)
    } else {
      toast.error("Failed to confirm")
    }
    setPending(false)
  }

  if (confirmed) return null

  return (
    <Button size="sm" variant="outline" className="w-full gap-2" onClick={handleConfirm} disabled={pending}>
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
      Confirm I&apos;m coming
    </Button>
  )
}
