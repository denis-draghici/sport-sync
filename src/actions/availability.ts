"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { runMatchingForUser } from "@/lib/matching/engine"
import { Sport } from "@prisma/client"
import { toUtcMidnight, todayUtc } from "@/lib/date"

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

export async function setAvailability(isAvailable: boolean, sports: Sport[], dateStr?: string) {
  const userId = await getAuthUserId()
  const date = dateStr ? toUtcMidnight(new Date(dateStr)) : todayUtc()

  const availability = await prisma.availability.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, isAvailable, sports },
    update: { isAvailable, sports },
  })

  if (isAvailable && sports.length > 0) {
    // Run matching asynchronously — don't block the response
    runMatchingForUser(userId, date, sports).catch(console.error)
  }

  revalidatePath("/dashboard")
  return { success: true, availability }
}

export async function getTodayAvailability() {
  const userId = await getAuthUserId()
  const date = todayUtc()

  return prisma.availability.findUnique({
    where: { userId_date: { userId, date } },
  })
}

export async function getWeekAvailability() {
  const userId = await getAuthUserId()
  const today = todayUtc()
  const weekFromNow = new Date(today)
  weekFromNow.setDate(weekFromNow.getDate() + 7)

  return prisma.availability.findMany({
    where: {
      userId,
      date: { gte: today, lte: weekFromNow },
    },
    orderBy: { date: "asc" },
  })
}
