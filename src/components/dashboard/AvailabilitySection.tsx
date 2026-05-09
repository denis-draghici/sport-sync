"use client"

import { useState } from "react"
import { Sport, Availability } from "@prisma/client"
import { AvailabilityPrompt } from "./AvailabilityPrompt"
import { AvailablePlayersCard } from "./AvailablePlayersCard"

type AvailablePlayer = {
  id: string
  name: string
  avatarUrl: string | null
  location: string | null
  availableSports: Sport[]
}

interface Props {
  todayAvailability: Availability | null
  userSports: Sport[]
}

export function AvailabilitySection({ todayAvailability, userSports }: Props) {
  const [players, setPlayers] = useState<AvailablePlayer[]>([])
  const [loadingPlayers, setLoadingPlayers] = useState(false)

  function handlePlayersLoaded(p: AvailablePlayer[], loading: boolean) {
    setPlayers(p)
    setLoadingPlayers(loading)
  }

  const showPlayersCard = todayAvailability?.isAvailable || loadingPlayers || players.length > 0

  return (
    <>
      <AvailabilityPrompt
        todayAvailability={todayAvailability}
        userSports={userSports}
        onPlayersLoaded={handlePlayersLoaded}
      />
      {showPlayersCard && (
        <AvailablePlayersCard players={players} loading={loadingPlayers} />
      )}
    </>
  )
}
