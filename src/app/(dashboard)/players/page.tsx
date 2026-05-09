import { searchPlayers } from "@/actions/players"
import { getMyGroups } from "@/actions/groups"
import { getAuthUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { PlayerFilters } from "@/components/players/PlayerFilters"
import { PlayerCard } from "@/components/players/PlayerCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { Sport, SkillLevel } from "@prisma/client"
import { Users } from "lucide-react"

interface Props {
  searchParams: Promise<{ sport?: string; skill?: string; q?: string; invite?: string }>
}

export default async function PlayersPage({ searchParams }: Props) {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const sp = await searchParams
  const sport = sp.sport as Sport | undefined
  const skillLevel = sp.skill as SkillLevel | undefined
  const query = sp.q
  const inviteGroupId = sp.invite

  const [players, myGroups] = await Promise.all([
    searchPlayers(sport, skillLevel, query),
    getMyGroups(),
  ])

  const captainGroups = myGroups.filter((g) => g.captainId === authUser.id && g.status === "FORMING")

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="Find Players"
        description={inviteGroupId ? "Select players to invite to your group." : "Browse players by sport and skill level, then invite them to a group."}
      />

      <Suspense fallback={<div className="h-20 animate-pulse rounded-lg bg-muted" />}>
        <PlayerFilters />
      </Suspense>

      {players.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No players found"
          description="Try a different sport or skill filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player as any}
              captainGroups={captainGroups as any}
              currentUserId={authUser.id}
              defaultInviteGroupId={inviteGroupId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
