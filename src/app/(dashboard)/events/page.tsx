import { getAuthUser } from "@/actions/auth"
import { getMyEvents, getAvailableEvents } from "@/actions/events"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { EventsClient } from "@/components/events/EventsClient"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function EventsPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const [myEvents, availableEvents] = await Promise.all([
    getMyEvents(),
    getAvailableEvents(),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Events"
        description="Your upcoming events and events you can join"
        action={
          <Button asChild size="sm">
            <Link href="/events/new"><Plus className="h-4 w-4 mr-2" />New event</Link>
          </Button>
        }
      />

      <EventsClient
        myEvents={myEvents as any}
        availableEvents={availableEvents as any}
        currentUserId={authUser.id}
      />
    </div>
  )
}
