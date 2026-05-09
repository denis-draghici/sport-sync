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

export async function createPoll(
  eventId: string,
  question: string,
  options: Array<{ label: string; venueData?: object }>
) {
  const userId = await getAuthUserId()

  const event = await prisma.event.findFirst({
    where: { id: eventId, group: { captainId: userId } },
  })
  if (!event) return { error: "Only the captain can create polls" }

  const poll = await prisma.poll.create({
    data: {
      eventId,
      question,
      options: {
        create: options.map((o) => ({
          label: o.label,
          venueData: o.venueData ?? undefined,
        })),
      },
    },
    include: { options: true },
  })

  revalidatePath(`/events/${eventId}`)
  return { success: true, poll }
}

export async function castVote(pollId: string, optionId: string) {
  const userId = await getAuthUserId()

  const poll = await prisma.poll.findFirst({
    where: {
      id: pollId,
      event: { group: { members: { some: { userId } } } },
    },
  })
  if (!poll) return { error: "Poll not found or access denied" }

  await prisma.pollVote.upsert({
    where: { pollId_userId: { pollId, userId } },
    create: { pollId, optionId, userId },
    update: { optionId },
  })

  revalidatePath(`/events/${poll.eventId}`)
  return { success: true }
}

export async function getPollResults(pollId: string) {
  const userId = await getAuthUserId()

  const poll = await prisma.poll.findFirst({
    where: {
      id: pollId,
      event: { group: { members: { some: { userId } } } },
    },
    include: {
      options: {
        include: {
          _count: { select: { votes: true } },
          votes: { where: { userId }, select: { userId: true } },
        },
      },
    },
  })

  if (!poll) return null

  const totalVotes = poll.options.reduce((sum, o) => sum + o._count.votes, 0)

  return {
    ...poll,
    options: poll.options.map((o) => ({
      ...o,
      voteCount: o._count.votes,
      percentage: totalVotes > 0 ? Math.round((o._count.votes / totalVotes) * 100) : 0,
      hasVoted: o.votes.length > 0,
    })),
    totalVotes,
  }
}
