import { SkillLevel } from "@prisma/client"
import { cn } from "@/lib/utils"
import { SKILL_LEVEL_COLORS, SKILL_LEVEL_LABELS } from "@/lib/sports"

export function SkillBadge({ level }: { level: SkillLevel }) {
  return (
    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", SKILL_LEVEL_COLORS[level])}>
      {SKILL_LEVEL_LABELS[level]}
    </span>
  )
}
