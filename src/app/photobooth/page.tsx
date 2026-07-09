import { ServicesDock } from '@/app/services/components/ServicesDock';
import PhotoBoothClient from '@/components/photobooth/PhotoBoothClient';

export const dynamic = "force-dynamic";

export default function PhotoBoothPage() {
  return (
    <main className="relative min-h-screen w-full bg-black overflow-hidden font-sans">
      {/* Background gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-900/40 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-900/30 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full min-h-screen flex flex-col justify-between">
        {/* Main interactive area */}
        <div className="grow flex items-center justify-center py-10 pb-28">
          <PhotoBoothClient />
        </div>

        {/* Bottom Dock Navigation */}
        <ServicesDock />
      </div>
    </main>
  );
}
