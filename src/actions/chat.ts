"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

export async function sendMessage(groupId: string, content: string) {
  const userId = await getAuthUserId()

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 1000) return { error: "Invalid message" }

  // Verify membership
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!membership) return { error: "Not a group member" }

  const message = await prisma.message.create({
    data: { groupId, userId, content: trimmed },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })

  return { success: true, message }
}

export async function getMessageById(messageId: string) {
  await getAuthUserId()

  return prisma.message.findUnique({
    where: { id: messageId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
  })
}

export async function getMessageHistory(groupId: string, limit = 50) {
  const userId = await getAuthUserId()

  // Verify membership
  const membership = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  })
  if (!membership) throw new Error("Access denied")

  return prisma.message.findMany({
    where: { groupId },
    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
    take: limit,
  })
}
