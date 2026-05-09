import { getAuthUser } from "@/actions/auth"
import { getProfile } from "@/actions/profile"
import { getTodayAvailability } from "@/actions/availability"
import { getMyGroups } from "@/actions/groups"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { AvailabilityPrompt } from "@/components/dashboard/AvailabilityPrompt"
import { MatchCard } from "@/components/dashboard/MatchCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users } from "lucide-react"
import { Sport } from "@prisma/client"
import { formatDateLabel } from "@/lib/date"

export default async function DashboardPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const [profile, todayAvailability, groups] = await Promise.all([
    getProfile(authUser.id),
    getTodayAvailability(),
    getMyGroups(),
  ])

  if (!profile) redirect("/login")

  const userSports = profile.sportPreferences.map((p) => p.sport as Sport)
  const today = new Date()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={`Hey, ${profile.name.split(" ")[0]} 👋`}
        description={formatDateLabel(today)}
      />

      <AvailabilityPrompt
        todayAvailability={todayAvailability}
        userSports={userSports}
      />

      {/* Active groups / matches */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Your Active Groups
        </h2>
        {groups.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No active groups yet"
            description="Say yes to ShowUpToday to get matched with players, or create an event manually."
            action={
              <Button asChild>
                <Link href="/events/new">Create event</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {groups.map((group) => (
              <MatchCard key={group.id} group={group as any} currentUserId={authUser.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
