"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, User, CalendarDays, Users, LogOut } from "lucide-react"
import { signOut } from "@/actions/auth"
import { Button } from "@/components/ui/button"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/groups", label: "My Groups", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border bg-card px-4 py-6">
      <Link href="/dashboard" className="text-2xl font-extrabold text-primary mb-10 px-2 block">
        SportSync
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <form action={signOut}>
        <Button variant="ghost" type="submit" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </form>
    </aside>
  )
}
