import { Sport, SkillLevel } from "@prisma/client"

export const SPORT_LIST = Object.values(Sport)

export const SPORT_LABELS: Record<Sport, string> = {
  FOOTBALL: "Football",
  TENNIS: "Tennis",
  BASKETBALL: "Basketball",
  VOLLEYBALL: "Volleyball",
  RUNNING: "Running",
  CYCLING: "Cycling",
}

export const SPORT_EMOJIS: Record<Sport, string> = {
  FOOTBALL: "⚽",
  TENNIS: "🎾",
  BASKETBALL: "🏀",
  VOLLEYBALL: "🏐",
  RUNNING: "🏃",
  CYCLING: "🚴",
}

export const GROUP_SIZE_MAP: Record<Sport, { min: number; max: number; ideal: number }> = {
  FOOTBALL: { min: 1, max: 14, ideal: 11 },
  TENNIS: { min: 1, max: 4, ideal: 2 },
  BASKETBALL: { min: 1, max: 10, ideal: 10 },
  VOLLEYBALL: { min: 1, max: 12, ideal: 6 },
  RUNNING: { min: 1, max: 20, ideal: 4 },
  CYCLING: { min: 1, max: 20, ideal: 4 },
}

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
  PROFESSIONAL: "Professional",
}

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  BEGINNER: "bg-emerald-500/20 text-emerald-400",
  INTERMEDIATE: "bg-blue-500/20 text-blue-400",
  ADVANCED: "bg-orange-500/20 text-orange-400",
  PROFESSIONAL: "bg-purple-500/20 text-purple-400",
}

export const VENUE_PRICE_RANGES: Record<Sport, string> = {
  FOOTBALL: "€40–€120/hr",
  TENNIS: "€10–€30/hr",
  BASKETBALL: "€20–€60/hr",
  VOLLEYBALL: "€20–€60/hr",
  RUNNING: "Free",
  CYCLING: "Free",
}
