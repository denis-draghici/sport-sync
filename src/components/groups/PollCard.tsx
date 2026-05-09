"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { castVote } from "@/actions/polls"
import { toast } from "sonner"
import { Vote } from "lucide-react"

interface PollOption {
  id: string
  label: string
  voteCount: number
  percentage: number
  hasVoted: boolean
}

interface PollWithResults {
  id: string
  question: string
  options: PollOption[]
  totalVotes: number
}

export function PollCard({ poll, currentUserId }: { poll: PollWithResults; currentUserId: string }) {
  const [localPoll, setLocalPoll] = useState(poll)
  const [voting, setVoting] = useState(false)

  const userVotedOptionId = localPoll.options.find((o) => o.hasVoted)?.id

  async function handleVote(optionId: string) {
    if (voting) return
    setVoting(true)

    // Optimistic update
    const total = localPoll.totalVotes + (userVotedOptionId ? 0 : 1)
    setLocalPoll((prev) => ({
      ...prev,
      totalVotes: total,
      options: prev.options.map((o) => {
        let votes = o.voteCount
        if (o.id === optionId) votes += 1
        if (o.id === userVotedOptionId && o.id !== optionId) votes -= 1
        return { ...o, voteCount: votes, percentage: total > 0 ? Math.round((votes / total) * 100) : 0, hasVoted: o.id === optionId }
      }),
    }))

    const result = await castVote(localPoll.id, optionId)
    if (result?.error) {
      toast.error(result.error)
      setLocalPoll(poll) // revert
    }
    setVoting(false)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Vote className="h-4 w-4 text-primary" /> {localPoll.question}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{localPoll.totalVotes} vote{localPoll.totalVotes !== 1 ? "s" : ""}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {localPoll.options.map((option) => (
          <div key={option.id} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleVote(option.id)}
                disabled={voting}
                className="text-sm font-medium text-left hover:text-primary transition-colors disabled:opacity-50"
              >
                {option.hasVoted && <span className="text-primary mr-1">✓</span>}
                {option.label}
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{option.voteCount}</span>
                <Badge variant={option.hasVoted ? "default" : "outline"} className="text-xs w-12 justify-center">
                  {option.percentage}%
                </Badge>
              </div>
            </div>
            <Progress value={option.percentage} className="h-1.5" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
