import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const sports = [
  { emoji: "⚽", label: "Football" },
  { emoji: "🎾", label: "Tennis" },
  { emoji: "🏀", label: "Basketball" },
  { emoji: "🏐", label: "Volleyball" },
  { emoji: "🏃", label: "Running" },
  { emoji: "🚴", label: "Cycling" },
]

const steps = [
  { num: "01", title: "Create your profile", desc: "Add your sports, skill level, and a short bio. Done in 2 minutes." },
  { num: "02", title: "Say ShowUpToday?", desc: "Each morning, tap Yes or No. One click. That's it." },
  { num: "03", title: "Get matched", desc: "We find compatible players for your sport, group you up automatically." },
  { num: "04", title: "Show up & play", desc: "Chat with your group, vote on a venue, and get out there." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen app-surface">
      {/* Nav */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
          <span className="shrink-0 text-xl font-bold text-primary">SportSync</span>
          <div className="flex min-w-0 gap-1.5 sm:gap-3">
            <Button variant="ghost" className="px-2 sm:px-4" asChild><Link href="/login">Sign in</Link></Button>
            <Button className="px-2.5 sm:px-4" asChild>
              <Link href="/register">Get started<span className="hidden sm:inline"> free</span></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-20 lg:py-24">
        <Badge variant="secondary" className="mb-6 text-primary border-primary/30">
          ShowUp2Move Hackathon
        </Badge>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-7xl">
          Find your game.<br />
          <span className="text-primary">Show up and play.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-xl">
          SportSync matches you with compatible players nearby — automatically.
          One tap in the morning, a game by evening.
        </p>
        <div className="mx-auto flex max-w-md flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
          <Button size="lg" className="h-12 px-8 text-base sm:h-14 sm:text-lg" asChild>
            <Link href="/register">Start playing →</Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-base sm:h-14 sm:text-lg" asChild>
            <Link href="/login">Already have an account</Link>
          </Button>
        </div>
      </section>

      {/* Sports */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:pb-20">
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-4">
          {sports.map((s) => (
            <div key={s.label} className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-4 py-2 text-sm font-medium shadow-sm shadow-background/20 transition-colors hover:border-primary/40 sm:px-5 sm:py-2.5 sm:text-lg">
              <span>{s.emoji}</span> {s.label}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/80 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold sm:mb-14">How it works</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {steps.map((step) => (
              <div key={step.num} className="space-y-3 rounded-2xl border border-border bg-background/35 p-5">
                <span className="text-4xl font-black text-primary/30">{step.num}</span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
        <h2 className="mb-6 text-3xl font-bold sm:text-4xl">Ready to play?</h2>
        <p className="mb-8 text-base text-muted-foreground sm:text-lg">Join SportSync and never miss a game again.</p>
        <Button size="lg" className="h-14 w-full px-10 text-lg sm:w-auto" asChild>
          <Link href="/register">Create free account →</Link>
        </Button>
      </section>

      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <p>SportSync © 2026 · Built for ShowUp2Move Hackathon</p>
      </footer>
    </div>
  )
}
