import { getAuthUser } from "@/actions/auth"
import { getMyEvents } from "@/actions/events"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { EmptyState } from "@/components/shared/EmptyState"
import { EventCard } from "@/components/events/EventCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CalendarDays, Plus } from "lucide-react"

export default async function EventsPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const events = await getMyEvents()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Events"
        description="Your upcoming and past sports events"
        action={
          <Button asChild size="sm">
            <Link href="/events/new"><Plus className="h-4 w-4 mr-2" />New event</Link>
          </Button>
        }
      />

      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No events yet"
          description="Get matched via ShowUpToday or create an event manually."
          action={
            <Button asChild>
              <Link href="/events/new">Create event</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event as any} currentUserId={authUser.id} />
          ))}
        </div>
      )}
    </div>
  )
}
