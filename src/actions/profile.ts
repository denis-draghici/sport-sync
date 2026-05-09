"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { parseBioForSports } from "@/lib/ai/bio-parser"
import { analyzePhotoForSports } from "@/lib/ai/photo-analyzer"
import { Sport, SkillLevel } from "@prisma/client"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
})

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

export async function getProfile(userId?: string) {
  const id = userId ?? (await getAuthUserId())
  return prisma.user.findUnique({
    where: { id },
    include: { sportPreferences: true },
  })
}

export async function updateProfile(formData: FormData) {
  const userId = await getAuthUserId()

  const raw = {
    name: formData.get("name") as string,
    bio: (formData.get("bio") as string) || undefined,
    location: (formData.get("location") as string) || undefined,
  }

  const parsed = profileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
  })

  revalidatePath("/profile")
  return { success: true }
}

export async function uploadAvatar(formData: FormData) {
  const userId = await getAuthUserId()
  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  const supabase = await createClient()
  const ext = file.name.split(".").pop() ?? "webp"
  const path = `${userId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) return { error: error.message }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)
  const avatarUrl = urlData.publicUrl

  await prisma.user.update({ where: { id: userId }, data: { avatarUrl } })

  // Non-blocking photo analysis
  analyzePhotoForSports(avatarUrl).then(async (sports) => {
    if (sports.length === 0) return
    for (const sport of sports) {
      await prisma.sportPreference.upsert({
        where: { userId_sport: { userId, sport } },
        create: { userId, sport, skillLevel: SkillLevel.BEGINNER },
        update: {},
      })
    }
  }).catch(() => {})

  revalidatePath("/profile")
  return { success: true, avatarUrl }
}

export async function upsertSportPreference(sport: Sport, skillLevel: SkillLevel) {
  const userId = await getAuthUserId()

  await prisma.sportPreference.upsert({
    where: { userId_sport: { userId, sport } },
    create: { userId, sport, skillLevel },
    update: { skillLevel },
  })

  revalidatePath("/profile")
  return { success: true }
}

export async function removeSportPreference(sport: Sport) {
  const userId = await getAuthUserId()

  await prisma.sportPreference.delete({
    where: { userId_sport: { userId, sport } },
  })

  revalidatePath("/profile")
  return { success: true }
}

export async function getSuggestedSports(bio: string): Promise<Sport[]> {
  return parseBioForSports(bio)
}

export async function updateLocation(lat: number, lng: number, location: string) {
  const userId = await getAuthUserId()
  await prisma.user.update({ where: { id: userId }, data: { lat, lng, location } })
  revalidatePath("/profile")
  return { success: true }
}
