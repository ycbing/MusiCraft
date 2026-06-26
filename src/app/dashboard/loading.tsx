export default function DashboardLoading() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4 animate-pulse">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="glass rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-white/[0.06] rounded-full w-48" />
            <div className="h-3 bg-white/[0.04] rounded-full w-32" />
          </div>
        </div>

        {/* Timeline rows skeleton */}
        <div className="space-y-4 mt-8">
          <div className="h-4 bg-white/[0.04] rounded-full w-24" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-xl px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/[0.06] shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-white/[0.06] rounded-full w-40" />
                <div className="h-3 bg-white/[0.04] rounded-full w-24" />
              </div>
              <div className="h-3 bg-white/[0.04] rounded-full w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
