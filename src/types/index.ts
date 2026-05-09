import {
  User,
  SportPreference,
  Availability,
  Group,
  GroupMember,
  Event,
  Message,
  Poll,
  PollOption,
  PollVote,
} from "@prisma/client"

export type UserWithPrefs = User & {
  sportPreferences: SportPreference[]
}

export type GroupWithDetails = Group & {
  members: (GroupMember & { user: UserWithPrefs })[]
  event: Event | null
  captain: User
  _count?: { messages: number }
}

export type EventWithGroup = Event & {
  group: GroupWithDetails
  polls: (Poll & {
    options: (PollOption & { votes: PollVote[] })[]
  })[]
}

export type MessageWithUser = Message & {
  user: Pick<User, "id" | "name" | "avatarUrl">
}

export type PollWithResults = Poll & {
  options: (PollOption & {
    votes: PollVote[]
    _count: { votes: number }
  })[]
}

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}
