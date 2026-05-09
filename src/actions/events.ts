"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { Sport } from "@prisma/client"
import { z } from "zod"

async function getAuthUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")
  return user.id
}

const eventSchema = z.object({
  venueName: z.string().min(1).max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  venueId: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  scheduledAt: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export async function getMyEvents() {
  const userId = await getAuthUserId()

  return prisma.event.findMany({
    where: {
      group: {
        members: { some: { userId } },
        status: { not: "CANCELLED" },
      },
    },
    include: {
      group: {
        include: {
          members: { include: { user: true } },
          captain: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })
}

export async function getEvent(eventId: string) {
  await getAuthUserId()

  const event = await prisma.event.findFirst({
    where: { id: eventId },
    include: {
      group: {
        include: {
          members: { include: { user: { include: { sportPreferences: true } } } },
          captain: true,
        },
      },
      polls: {
        include: {
          options: {
            include: {
              votes: true,
              _count: { select: { votes: true } },
            },
          },
        },
      },
    },
  })

  if (!event) throw new Error("Event not found")
  return event
}

export async function updateEvent(eventId: string, formData: FormData) {
  const userId = await getAuthUserId()

  const event = await prisma.event.findFirst({
    where: { id: eventId, group: { captainId: userId } },
  })
  if (!event) return { error: "Only the captain can update the event" }

  const raw = {
    venueName: (formData.get("venueName") as string) || undefined,
    venueAddress: (formData.get("venueAddress") as string) || undefined,
    venueId: (formData.get("venueId") as string) || undefined,
    lat: formData.get("lat") ? Number(formData.get("lat")) : undefined,
    lng: formData.get("lng") ? Number(formData.get("lng")) : undefined,
    scheduledAt: (formData.get("scheduledAt") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
  }

  const parsed = eventSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...parsed.data,
      scheduledAt: parsed.data.scheduledAt ? new Date(parsed.data.scheduledAt) : undefined,
    },
  })

  revalidatePath(`/events/${eventId}`)
  revalidatePath("/events")
  return { success: true, event: updated }
}

export async function getAvailableEvents() {
  const userId = await getAuthUserId()

  return prisma.event.findMany({
    where: {
      group: {
        status: { not: "CANCELLED" },
        members: { none: { userId } },
      },
    },
    include: {
      group: {
        include: {
          members: { include: { user: true } },
          captain: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
  })
}

export async function joinEvent(eventId: string) {
  const userId = await getAuthUserId()

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      group: { status: { not: "CANCELLED" } },
    },
    include: { group: true },
  })
  if (!event) return { error: "Event not found" }

  const already = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: event.groupId, userId } },
  })
  if (already) return { error: "You already joined this event" }

  await prisma.groupMember.create({ data: { groupId: event.groupId, userId } })

  revalidatePath("/events")
  return { success: true }
}

export async function createManualEvent(formData: FormData) {
  const userId = await getAuthUserId()
  const sport = formData.get("sport") as Sport

  if (!sport) return { error: "Sport is required" }

  const group = await prisma.group.create({
    data: {
      sport,
      status: "EVENT_CREATED",
      captainId: userId,
      availDate: new Date(),
      members: { create: { userId } },
    },
  })

  const event = await prisma.event.create({
    data: {
      groupId: group.id,
      sport,
      venueName: (formData.get("venueName") as string) || undefined,
      venueAddress: (formData.get("venueAddress") as string) || undefined,
      scheduledAt: formData.get("scheduledAt")
        ? new Date(formData.get("scheduledAt") as string)
        : undefined,
      notes: (formData.get("notes") as string) || undefined,
    },
  })

  revalidatePath("/events")
  return { success: true, event, groupId: group.id }
}
