"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

export async function getMyGroups() {
  const userId = await getAuthUserId()

  return prisma.group.findMany({
    where: {
      members: { some: { userId } },
      status: { not: "CANCELLED" },
    },
    include: {
      members: { include: { user: { include: { sportPreferences: true } } } },
      event: true,
      captain: true,
      _count: { select: { messages: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getGroup(groupId: string) {
  const userId = await getAuthUserId()

  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      members: { some: { userId } },
    },
    include: {
      members: { include: { user: { include: { sportPreferences: true } } } },
      event: {
        include: {
          polls: {
            include: {
              options: { include: { votes: true, _count: { select: { votes: true } } } },
            },
          },
        },
      },
      captain: true,
    },
  })

  if (!group) throw new Error("Group not found or access denied")
  return group
}

export async function leaveGroup(groupId: string) {
  const userId = await getAuthUserId()

  await prisma.groupMember.delete({
    where: { groupId_userId: { groupId, userId } },
  })

  revalidatePath("/dashboard")
  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function confirmParticipation(groupId: string) {
  const userId = await getAuthUserId()

  await prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { confirmedAt: new Date() },
  })

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}

export async function unconfirmParticipation(groupId: string) {
  const userId = await getAuthUserId()

  await prisma.groupMember.update({
    where: { groupId_userId: { groupId, userId } },
    data: { confirmedAt: null },
  })

  revalidatePath(`/groups/${groupId}`)
  return { success: true }
}
