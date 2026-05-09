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
    <div className={cn("mb-2 flex items-end gap-1.5 sm:gap-2", isOwn ? "flex-row-reverse" : "flex-row")}>
      {!isOwn && (
        <UserAvatar name={message.user.name} avatarUrl={message.user.avatarUrl} size="sm" className="mb-1 shrink-0 max-[360px]:hidden" />
      )}
      <div className={cn("max-w-[90%] space-y-1 max-[360px]:max-w-[94%] sm:max-w-[75%]", isOwn ? "items-end" : "items-start")}>
        {!isOwn && (
          <p className="truncate px-1 text-xs text-muted-foreground max-[360px]:hidden">{message.user.name}</p>
        )}
        <div
          className={cn(
            "rounded-2xl px-3 py-2 text-sm leading-relaxed break-words shadow-sm max-[360px]:px-2.5",
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
