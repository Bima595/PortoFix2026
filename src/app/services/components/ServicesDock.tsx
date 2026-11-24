'use client';

import Dock from '@/components/Dock';
import { Home, Users, Camera } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface ServicesDockProps {
  floating?: boolean;
}

export function ServicesDock({ floating = true }: ServicesDockProps) {
  const router = useRouter();
  const pathname = usePathname();

  const dockItems = [
    {
      icon: (
        <Home
          className={`w-5 h-5 ${pathname === '/' ? 'text-zinc-100' : 'text-zinc-400'}`}
          aria-hidden="true"
        />
      ),
      label: 'Home',
      onClick: () => router.push('/'),
    },
    {
      icon: (
        <Users
          className={`w-5 h-5 ${pathname === '/services' ? 'text-zinc-100' : 'text-zinc-400'}`}
          aria-hidden="true"
        />
      ),
      label: 'My Services',
      onClick: () => {
        if (pathname === '/services') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          router.push('/services');
        }
      },
    },
    {
      icon: (
        <Camera
          className={`w-5 h-5 ${pathname === '/photobooth' ? 'text-zinc-100' : 'text-zinc-400'}`}
          aria-hidden="true"
        />
      ),
      label: 'Photo Booth',
      onClick: () => {
        if (pathname === '/photobooth') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          router.push('/photobooth');
        }
      },
    },
  ];

  if (!floating) {
    return (
      <div className="w-full pt-2 pb-2 flex justify-center">
        <Dock items={dockItems} />
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="pointer-events-auto">
        <Dock items={dockItems} />
      </div>
    </div>
  );
}
