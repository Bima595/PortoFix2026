import type { Metadata } from 'next';
import { ServicesDock } from '@/app/services/components/ServicesDock';
import PhotoBoothClient from '@/components/photobooth/PhotoBoothClient';
import { getPhotoboothTemplates } from '@/lib/sanity/api';
import type { PhotoboothTemplate } from '@/types/portfolio';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Photo Booth Studio Online',
  description:
    'Interactive online Photo Booth Studio by Satria Abimanyu (Satriabmnyu) with 18+ frames, filters, stickers, custom PNG auto-fit, and HD PNG export.',
  alternates: {
    canonical: '/photobooth',
  },
};

export default async function PhotoBoothPage() {
  let sanityTemplates: PhotoboothTemplate[] = [];
  try {
    const fetched = await getPhotoboothTemplates();
    if (Array.isArray(fetched)) {
      sanityTemplates = fetched;
    }
  } catch (err) {
    console.error('Failed to load Sanity photobooth templates:', err);
  }

  return (
    <main className="relative min-h-dvh w-full bg-[#09090B] text-[#FAFAFA] overflow-x-clip font-sans">
      <div className="relative z-10 w-full min-h-dvh flex flex-col justify-between">
        <div className="grow flex items-start justify-center py-8 sm:py-10 pb-8">
          <PhotoBoothClient initialSanityTemplates={sanityTemplates} />
        </div>

        <ServicesDock floating={false} />
      </div>
    </main>
  );
}
