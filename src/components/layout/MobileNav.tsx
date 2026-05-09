"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, CalendarDays, Users, UserSearch } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/players", label: "Players", icon: UserSearch },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 shadow-2xl shadow-background/40 backdrop-blur safe-area-bottom">
      <div className="grid grid-cols-5 px-1 pt-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors",
                active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="max-w-full truncate">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
