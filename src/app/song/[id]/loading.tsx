export default function SongLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero cover skeleton */}
      <div className="relative w-full h-[50vh] min-h-[420px] max-h-[580px] bg-white/[0.02]">
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="flex gap-2">
              <div className="h-5 bg-white/[0.08] rounded-full w-16" />
              <div className="h-5 bg-white/[0.08] rounded-full w-16" />
              <div className="h-5 bg-white/[0.08] rounded-full w-12" />
            </div>
            <div className="h-10 bg-white/[0.08] rounded-full w-48" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10 space-y-6">
        <div className="glass rounded-2xl p-8 space-y-4">
          <div className="h-6 bg-white/[0.06] rounded-full w-48 mx-auto" />
          <div className="h-4 bg-white/[0.04] rounded-full w-64 mx-auto" />
        </div>

        <div className="glass rounded-2xl p-6 space-y-3">
          <div className="h-4 bg-white/[0.04] rounded-full w-24" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-3 bg-white/[0.03] rounded-full" style={{ width: `${40 + Math.random() * 60}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
