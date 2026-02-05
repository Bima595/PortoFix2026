export default function Loading() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <main className="relative z-10 w-full max-w-xl mx-auto min-h-screen flex flex-col justify-start md:justify-center items-start py-8 md:py-20 px-6 md:px-0">
        <div className="flex flex-col gap-6 md:gap-12 text-zinc-100 w-full">
          
          {/* Bio Section Skeleton */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-zinc-800 animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* About Section Skeleton */}
          <div className="flex flex-col gap-3">
             <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
             <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
             <div className="h-4 w-5/6 bg-zinc-800 rounded animate-pulse" />
          </div>

          {/* Work Experience Skeleton */}
          <div className="flex flex-col gap-4">
             <div className="h-6 w-40 bg-zinc-800 rounded animate-pulse mb-2" />
             {[1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
                    <div className="flex justify-between">
                         <div className="h-5 w-32 bg-zinc-800 rounded animate-pulse" />
                         <div className="h-4 w-20 bg-zinc-800 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
                </div>
             ))}
          </div>

          {/* Side Projects Skeleton */}
           <div className="flex flex-col gap-4">
             <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse mb-2" />
             <div className="grid grid-cols-2 gap-4">
                 {[1, 2, 3, 4].map((i) => (
                     <div key={i} className="aspect-video rounded-xl bg-zinc-800 animate-pulse" />
                 ))}
             </div>
           </div>

        </div>
      </main>
    </div>
  );
}
