"use client"

import { SportPreference } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SportIcon } from "@/components/shared/SportIcon"
import { SkillBadge } from "@/components/shared/SkillBadge"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import { removeSportPreference } from "@/actions/profile"
import { toast } from "sonner"
import Link from "next/link"
import { SPORT_LABELS } from "@/lib/sports"

interface Props {
  preferences: SportPreference[]
  editable?: boolean
}

export function SportPreferenceList({ preferences, editable = false }: Props) {
  async function handleRemove(sport: SportPreference["sport"]) {
    const result = await removeSportPreference(sport)
    if (result?.success) toast.success(`${SPORT_LABELS[sport]} removed`)
    else toast.error("Failed to remove sport")
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Sports & Skills</CardTitle>
        {editable && (
          <Button size="sm" variant="outline" asChild>
            <Link href="/profile/edit#sports"><Plus className="h-3 w-3 mr-1" />Add sport</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {preferences.length === 0 && (
          <p className="text-muted-foreground text-sm">No sports added yet.</p>
        )}
        {preferences.map((pref) => (
          <div key={pref.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
            <div className="flex items-center gap-2">
              <SportIcon sport={pref.sport} size="sm" />
              <span className="text-sm font-medium">{SPORT_LABELS[pref.sport]}</span>
              <SkillBadge level={pref.skillLevel} />
            </div>
            {editable && (
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(pref.sport)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
