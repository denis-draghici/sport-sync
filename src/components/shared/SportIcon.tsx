import { Sport } from "@prisma/client"
import { SPORT_EMOJIS, SPORT_LABELS } from "@/lib/sports"

interface SportIconProps {
  sport: Sport
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

const sizeMap = { sm: "text-base", md: "text-2xl", lg: "text-4xl" }

export function SportIcon({ sport, showLabel = false, size = "md" }: SportIconProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeMap[size]}`}>
      <span>{SPORT_EMOJIS[sport]}</span>
      {showLabel && <span className="text-sm font-medium">{SPORT_LABELS[sport]}</span>}
    </span>
  )
}
