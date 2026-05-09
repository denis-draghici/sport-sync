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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-primary">SportSync</span>
          <div className="flex gap-3">
            <Button variant="ghost" asChild><Link href="/login">Sign in</Link></Button>
            <Button asChild><Link href="/register">Get started free</Link></Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-6 text-primary border-primary/30">
          ShowUp2Move Hackathon
        </Badge>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Find your game.<br />
          <span className="text-primary">Show up and play.</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          SportSync matches you with compatible players nearby — automatically.
          One tap in the morning, a game by evening.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="text-lg px-8 h-14" asChild>
            <Link href="/register">Start playing →</Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 h-14" asChild>
            <Link href="/login">Already have an account</Link>
          </Button>
        </div>
      </section>

      {/* Sports */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex flex-wrap justify-center gap-4">
          {sports.map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2.5 text-lg font-medium">
              <span>{s.emoji}</span> {s.label}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-card border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-14">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="space-y-3">
                <span className="text-4xl font-black text-primary/30">{step.num}</span>
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to play?</h2>
        <p className="text-muted-foreground mb-8 text-lg">Join SportSync and never miss a game again.</p>
        <Button size="lg" className="text-lg px-10 h-14" asChild>
          <Link href="/register">Create free account →</Link>
        </Button>
      </section>

      <footer className="border-t border-border py-8 text-center text-muted-foreground text-sm">
        <p>SportSync © 2026 · Built for ShowUp2Move Hackathon</p>
      </footer>
    </div>
  )
}
