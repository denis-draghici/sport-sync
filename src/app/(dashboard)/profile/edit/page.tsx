import { getProfile } from "@/actions/profile"
import { getAuthUser } from "@/actions/auth"
import { redirect } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { ProfileEditForm } from "@/components/profile/ProfileEditForm"

export default async function ProfileEditPage() {
  const authUser = await getAuthUser()
  if (!authUser) redirect("/login")

  const profile = await getProfile(authUser.id)
  if (!profile) redirect("/login") // only if upsert itself failed

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Edit Profile" description="Update your information and sports preferences" />
      <ProfileEditForm profile={profile} />
    </div>
  )
}
