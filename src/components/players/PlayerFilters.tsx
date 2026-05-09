"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Sport, SkillLevel } from "@prisma/client"
import { SPORT_LABELS, SPORT_EMOJIS, SKILL_LEVEL_LABELS } from "@/lib/sports"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useTransition, useState } from "react"
import { Search } from "lucide-react"

export function PlayerFilters() {
  const router = useRouter()
  const sp = useSearchParams()
  const [, startTransition] = useTransition()
  const [q, setQ] = useState(sp.get("q") ?? "")

  const currentSport = sp.get("sport") as Sport | null
  const currentSkill = sp.get("skill") as SkillLevel | null

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`/players?${params.toString()}`))
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    update("q", q || null)
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or location…"
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" className="sm:w-auto">Search</Button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        <Button
          size="sm"
          variant={!currentSport ? "default" : "secondary"}
          className="shrink-0"
          onClick={() => update("sport", null)}
        >
          All sports
        </Button>
        {Object.values(Sport).map((s) => (
          <Button
            key={s}
            size="sm"
            variant={currentSport === s ? "default" : "secondary"}
            className="shrink-0"
            onClick={() => update("sport", s)}
          >
            {SPORT_EMOJIS[s]} {SPORT_LABELS[s]}
          </Button>
        ))}
      </div>

      {currentSport && (
        <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
          <Button
            size="sm"
            variant={!currentSkill ? "default" : "outline"}
            className="shrink-0"
            onClick={() => update("skill", null)}
          >
            All levels
          </Button>
          {Object.values(SkillLevel).map((sl) => (
            <Button
              key={sl}
              size="sm"
              variant={currentSkill === sl ? "default" : "outline"}
              className="shrink-0"
              onClick={() => update("skill", sl)}
            >
              {SKILL_LEVEL_LABELS[sl]}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
