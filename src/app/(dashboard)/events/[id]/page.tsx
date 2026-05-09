import { getAuthUser } from "@/actions/auth"
import { getEvent } from "@/actions/events"
import { redirect, notFound } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { EventDetailCard } from "@/components/events/EventDetailCard"
import { VenueSuggestList } from "@/components/events/VenueSuggestList"
import { PollCard } from "@/components/groups/PollCard"
import { recommendVenues } from "@/lib/ai/venue-recommender"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  let event
  try {
    event = await getEvent(id)
  } catch {
    notFound()
  }

  const isCaptain = event.group.captainId === authUser.id

  const venueRecommendations = isCaptain && event.group.captain.location
    ? await recommendVenues(event.sport, event.group.members.length, event.group.captain.location)
    : []

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`${isCaptain ? "⚡ " : ""}Event Details`}
        action={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/groups/${event.groupId}`}>
              <MessageCircle className="h-4 w-4 mr-2" /> Group chat
            </Link>
          </Button>
        }
      />

      <EventDetailCard event={event as any} currentUserId={authUser.id} isCaptain={isCaptain} />

      {/* AI venue recommendations — captain only */}
      {isCaptain && venueRecommendations.length > 0 && (
        <VenueSuggestList
          recommendations={venueRecommendations}
          eventId={event.id}
          sport={event.sport}
          lat={event.group.captain.lat}
          lng={event.group.captain.lng}
        />
      )}

      {/* Polls */}
      {event.polls.map((poll) => (
        <PollCard key={poll.id} poll={poll as any} currentUserId={authUser.id} />
      ))}
    </div>
  )
}
