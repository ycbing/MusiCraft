export default function GlobalLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 animate-pulse">
      {/* NavBar placeholder */}
      <div className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/50 backdrop-blur-xl border-b border-white/10" />

      <div className="max-w-5xl mx-auto space-y-6">
        {/* 3 pulse cards */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="glass rounded-2xl p-6 space-y-4"
          >
            <div className="h-4 bg-white/[0.06] rounded-full w-1/3" />
            <div className="h-3 bg-white/[0.04] rounded-full w-2/3" />
            <div className="h-3 bg-white/[0.04] rounded-full w-1/2" />
            <div className="flex gap-3 pt-2">
              <div className="h-8 bg-white/[0.06] rounded-lg w-20" />
              <div className="h-8 bg-white/[0.06] rounded-lg w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
