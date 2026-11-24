export default function Loading() {
  return (
    <div className="home-mono min-h-dvh w-full">
      <main className="mx-auto w-full max-w-5xl px-5 pt-10 pb-36 sm:px-8 sm:pt-16 sm:pb-40 lg:px-10">
        <p role="status" className="mb-6 text-xs text-[#94949E]">
          Loading portfolio...
        </p>

        {/* Two-Row Hero Skeleton */}
        <div className="border-b border-white/10 pb-12 sm:pb-16">
          {/* Row 1 */}
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 sm:pb-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="h-20 w-20 shrink-0 rounded-2xl bg-zinc-900 animate-pulse sm:h-24 sm:w-24" />
              <div className="space-y-2.5">
                <div className="h-9 w-64 max-w-full rounded bg-zinc-900 animate-pulse sm:h-11 sm:w-80" />
                <div className="h-4 w-48 rounded bg-zinc-900 animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="h-11 w-36 rounded-full bg-zinc-900 animate-pulse" />
              <div className="h-11 w-24 rounded-full bg-zinc-900 animate-pulse" />
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 gap-8 pt-8 sm:pt-10 md:grid-cols-12 md:items-start">
            <div className="md:order-2 md:col-span-5">
              <div className="divide-y divide-white/10 overflow-hidden rounded-2xl border border-white/10 bg-[#111113]">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center justify-between gap-4 px-5 py-4">
                    <div className="h-4 w-24 rounded bg-zinc-900 animate-pulse" />
                    <div className="h-4 w-32 rounded bg-zinc-900 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3 md:order-1 md:col-span-7">
              <div className="h-5 w-full rounded bg-zinc-900 animate-pulse" />
              <div className="h-5 w-11/12 rounded bg-zinc-900 animate-pulse" />
              <div className="h-5 w-3/4 rounded bg-zinc-900 animate-pulse" />
              <div className="h-5 w-32 rounded bg-zinc-900 animate-pulse pt-2" />
            </div>
          </div>
        </div>

        {/* Experience Skeleton */}
        <div className="mt-20 space-y-6 sm:mt-28">
          <div className="h-9 w-44 rounded bg-zinc-900 animate-pulse" />
          <div className="divide-y divide-white/10">
            {[1, 2].map((row) => (
              <div
                key={row}
                className="grid grid-cols-1 gap-4 py-7 md:grid-cols-[148px_240px_minmax(0,1fr)] md:gap-8"
              >
                <div className="h-4 w-24 rounded bg-zinc-900 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-44 rounded bg-zinc-900 animate-pulse" />
                  <div className="h-4 w-28 rounded bg-zinc-900 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded bg-zinc-900 animate-pulse" />
                  <div className="h-4 w-5/6 rounded bg-zinc-900 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
