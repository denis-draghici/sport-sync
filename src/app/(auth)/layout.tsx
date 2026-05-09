export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-3xl font-extrabold text-primary">SportSync</span>
          <p className="text-muted-foreground mt-1 text-sm">Find your game. Show up and play.</p>
        </div>
        {children}
      </div>
    </div>
  )
}
