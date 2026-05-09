import { prisma } from "@/lib/prisma"
import { Sport, GroupStatus } from "@prisma/client"
import { GROUP_SIZE_MAP } from "@/lib/sports"
import { scoreCompatibility } from "@/lib/ai/compatibility"
import { toUtcMidnight } from "@/lib/date"

export async function runMatchingForUser(
  userId: string,
  date: Date,
  sports: Sport[]
): Promise<void> {
  const normalizedDate = toUtcMidnight(date)

  await Promise.all(sports.map((sport) => matchForSport(userId, normalizedDate, sport)))
}

async function matchForSport(
  userId: string,
  date: Date,
  sport: Sport
): Promise<void> {
  const { min, max, ideal } = GROUP_SIZE_MAP[sport]

  // Check if user is already in a group for this sport+date
  const existingMembership = await prisma.groupMember.findFirst({
    where: {
      userId,
      group: {
        sport,
        availDate: date,
        status: { in: [GroupStatus.FORMING, GroupStatus.CONFIRMED, GroupStatus.EVENT_CREATED] },
      },
    },
  })
  if (existingMembership) return

  // Find all available users for this sport+date (excluding those already in groups)
  const availableUsers = await prisma.availability.findMany({
    where: {
      date,
      isAvailable: true,
      sports: { has: sport },
    },
    include: {
      user: {
        include: { sportPreferences: true },
      },
    },
  })

  // Exclude users already in a group for this sport+date
  const groupedUserIds = await prisma.groupMember.findMany({
    where: {
      group: {
        sport,
        availDate: date,
        status: { in: [GroupStatus.FORMING, GroupStatus.CONFIRMED, GroupStatus.EVENT_CREATED] },
      },
    },
    select: { userId: true },
  })
  const groupedIds = new Set(groupedUserIds.map((m) => m.userId))

  const pool = availableUsers
    .filter((a) => !groupedIds.has(a.userId))
    .map((a) => a.user)

  if (pool.length < min) return

  // AI compatibility scoring
  let scoredPool = pool.map((u) => ({ user: u, score: 50 }))

  try {
    const scores = await scoreCompatibility(
      pool.map((u) => ({
        id: u.id,
        name: u.name,
        bio: u.bio,
        sports: u.sportPreferences.map((sp) => ({
          sport: sp.sport,
          skillLevel: sp.skillLevel,
        })),
      }))
    )

    scoredPool = pool.map((u) => ({
      user: u,
      score: scores[u.id.slice(0, 8)] ?? 50,
    }))
  } catch {
    // Use default scores if AI fails
  }

  // Sort by compatibility score, pick ideal group size
  scoredPool.sort((a, b) => b.score - a.score)
  const groupSize = Math.min(ideal, Math.min(max, pool.length))
  const selected = scoredPool.slice(0, groupSize).map((s) => s.user)

  if (selected.length < min) return

  // Assign random captain
  const captainIndex = Math.floor(Math.random() * selected.length)
  const captain = selected[captainIndex]

  // Create group + members + event stub in a transaction
  await prisma.$transaction(async (tx) => {
    const group = await tx.group.create({
      data: {
        sport,
        status: GroupStatus.EVENT_CREATED,
        captainId: captain.id,
        availDate: date,
        members: {
          create: selected.map((u) => ({ userId: u.id })),
        },
      },
    })

    await tx.event.create({
      data: {
        groupId: group.id,
        sport,
      },
    })

    return group
  })
}
