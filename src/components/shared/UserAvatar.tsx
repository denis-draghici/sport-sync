import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  avatarUrl?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeMap = { sm: "h-7 w-7 text-xs", md: "h-9 w-9 text-sm", lg: "h-14 w-14 text-lg" }

export function UserAvatar({ name, avatarUrl, size = "md", className }: UserAvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <Avatar className={cn(sizeMap[size], className)}>
      <AvatarImage src={avatarUrl ?? undefined} alt={name} />
      <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
    </Avatar>
  )
}
