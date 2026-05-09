import { getProfile } from "@/actions/profile"
import { getAuthUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { SportPreferenceList } from "@/components/profile/SportPreferenceList"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Pencil } from "lucide-react"

export default async function ProfilePage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const profile = await getProfile(authUser.id)
  if (!profile) redirect("/profile/edit")

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Your Profile"
        action={
          <Button asChild size="sm">
            <Link href="/profile/edit"><Pencil className="h-4 w-4 mr-2" />Edit profile</Link>
          </Button>
        }
      />
      <ProfileCard profile={profile} />
      <SportPreferenceList preferences={profile.sportPreferences} editable />
    </div>
  )
}
