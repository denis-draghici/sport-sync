import { redirect } from "next/navigation"
import { getAuthUser } from "@/actions/auth"
import { getMyGroups } from "@/actions/groups"
import { PageHeader } from "@/components/shared/PageHeader"
import { MatchCard } from "@/components/dashboard/MatchCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function GroupsPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const groups = await getMyGroups()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="My Groups" description="All your matched and manual sports groups" />
      {groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups yet"
          description="Mark yourself available on the dashboard to get auto-matched, or create an event."
          action={
            <Button asChild>
              <Link href="/dashboard">Go to dashboard</Link>
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
    </div>
  )
}
