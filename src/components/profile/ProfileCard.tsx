import { User, SportPreference } from "@prisma/client"
import { Card, CardContent } from "@/components/ui/card"
import { UserAvatar } from "@/components/shared/UserAvatar"
import { MapPin } from "lucide-react"

type ProfileWithPrefs = User & { sportPreferences: SportPreference[] }

export function ProfileCard({ profile }: { profile: ProfileWithPrefs }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <UserAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="lg" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold">{profile.name}</h2>
            <p className="text-muted-foreground text-sm">{profile.email}</p>
            {profile.location && (
              <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" /> {profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="text-sm mt-3 leading-relaxed text-foreground/80">{profile.bio}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
