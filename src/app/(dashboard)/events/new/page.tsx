import { getAuthUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { ManualEventForm } from "@/components/events/ManualEventForm"

export default async function NewEventPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <PageHeader title="Create Event" description="Manually organize a sports event and invite players" />
      <ManualEventForm />
    </div>
  )
}
