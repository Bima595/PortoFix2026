import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Satria Abimanyu Putra Wijayatama (Satriabmnyu)',
    short_name: 'Satriabmnyu',
    description:
      'Portfolio of Satria Abimanyu Putra Wijayatama (Satriabmnyu), Software Engineer and Full Stack Developer.',
    start_url: '/',
    display: 'standalone',
    background_color: '#09090B',
    theme_color: '#09090B',
    icons: [
      {
        src: '/satria-logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
