import { UserAvatar } from "@/components/shared/UserAvatar"
import { cn } from "@/lib/utils"
import type { MessageWithUser } from "@/types"
import { format } from "date-fns"

interface Props {
  message: MessageWithUser
  isOwn: boolean
}

export function MessageBubble({ message, isOwn }: Props) {
  return (
    <div className={cn("flex items-end gap-2 mb-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <UserAvatar name={message.user.name} avatarUrl={message.user.avatarUrl} size="sm" className="shrink-0 mb-1" />
      )}
      <div className={cn("max-w-[75%] space-y-1", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <p className="text-xs text-muted-foreground px-1">{message.user.name}</p>
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed break-words",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-secondary text-foreground rounded-bl-sm"
          )}
        >
          {message.content}
        </div>
        <p className={cn("text-xs text-muted-foreground px-1", isOwn ? "text-right" : "text-left")}>
          {format(new Date(message.createdAt), "HH:mm")}
        </p>
      </div>
    </div>
  )
}
