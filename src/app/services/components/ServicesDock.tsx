'use client';

import Dock from '@/components/Dock';
import { Home, Users, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ServicesDock() {
  const router = useRouter();

  const dockItems = [
    {
      icon: <Home className="w-5 h-5 text-zinc-400" />,
      label: 'Home',
      onClick: () => router.push('/'),
    },
    {
      icon: <Users className="w-5 h-5 text-zinc-400" />,
      label: 'My Services',
      onClick: () => {
        if (window.location.pathname === '/services') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          router.push('/services');
        }
      },
    },
    // {
    //   icon: <Camera className="w-5 h-5 text-zinc-400" />,
    //   label: 'Photo Booth',
    //   onClick: () => {
    //     if (window.location.pathname === '/photobooth') {
    //       window.scrollTo({ top: 0, behavior: 'smooth' });
    //     } else {
    //       router.push('/photobooth');
    //     }
    //   },
    // },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <Dock items={dockItems} />
    </div>
  );
}
