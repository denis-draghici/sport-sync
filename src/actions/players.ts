"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { Sport, SkillLevel } from "@prisma/client"
import { revalidatePath } from "next/cache"

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

export async function searchPlayers(sport?: Sport, skillLevel?: SkillLevel, query?: string) {
  const userId = await getAuthUserId()

  return prisma.user.findMany({
    where: {
      id: { not: userId },
      ...(query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { location: { contains: query, mode: "insensitive" } },
        ],
      } : {}),
      ...(sport ? {
        sportPreferences: { some: { sport, ...(skillLevel ? { skillLevel } : {}) } },
      } : {}),
    },
    include: { sportPreferences: true },
    orderBy: { name: "asc" },
    take: 50,
  })
}

export async function inviteToGroup(groupId: string, inviteeId: string) {
  const userId = await getAuthUserId()

  const group = await prisma.group.findFirst({
    where: { id: groupId, captainId: userId },
  })
  if (!group) return { error: "Only the captain can invite players" }

  const already = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: inviteeId } },
  })
  if (already) return { error: "Player is already in this group" }

  await prisma.groupMember.create({
    data: { groupId, userId: inviteeId },
  })

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function createManualGroup(sport: Sport, inviteeIds: string[]) {
  const captainId = await getAuthUserId()

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // Check if a group already exists between these exact members for this sport today
  const existingGroup = await prisma.group.findFirst({
    where: {
      sport,
      availDate: today,
      status: { in: ["FORMING", "CONFIRMED", "EVENT_CREATED"] },
      members: { some: { userId: captainId } },
      AND: inviteeIds.map((id) => ({ members: { some: { userId: id } } })),
    },
  })
  if (existingGroup) return { error: "A group with this player already exists", groupId: existingGroup.id }

  const group = await prisma.$transaction(async (tx) => {
    const g = await tx.group.create({
      data: {
        sport,
        captainId,
        availDate: today,
        status: "FORMING",
      },
    })

    // Add captain + invitees as members
    const memberIds = [captainId, ...inviteeIds.filter((id) => id !== captainId)]
    await tx.groupMember.createMany({
      data: memberIds.map((uid) => ({ groupId: g.id, userId: uid })),
      skipDuplicates: true,
    })

    // Create event stub
    await tx.event.create({
      data: { groupId: g.id, sport, status: "SCHEDULED" },
    })

    return g
  })

  revalidatePath("/groups")
  revalidatePath("/dashboard")
  return { success: true, groupId: group.id }
}
