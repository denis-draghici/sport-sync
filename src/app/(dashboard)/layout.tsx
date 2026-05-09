import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { MobileNav } from "@/components/layout/MobileNav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen app-surface">
      <Sidebar />
      <div className="flex-1 flex min-h-screen min-w-0 flex-col">
        <TopNav />
        <main className="flex-1 overflow-x-hidden px-3 py-4 pb-28 sm:px-4 lg:px-6 lg:py-6 lg:pb-6">
          {children}
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
