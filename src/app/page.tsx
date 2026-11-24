import { PortfolioContent } from '@/components/portfolio/PortfolioContent';
import { ReloadButton } from '@/components/portfolio/ReloadButton';
import { urlFor } from '@/sanity/lib/image';
import {
  getBio,
  getWorkExperience,
  getSideProjects,
  getEducation,
  getSkills,
  getRewards,
  getCertificates,
} from '@/lib/sanity/api';
import Link from 'next/link';

export const revalidate = 60;

export default async function Home() {
  let data: Awaited<
    Promise<
      [
        Awaited<ReturnType<typeof getBio>>,
        Awaited<ReturnType<typeof getWorkExperience>>,
        Awaited<ReturnType<typeof getSideProjects>>,
        Awaited<ReturnType<typeof getEducation>>,
        Awaited<ReturnType<typeof getSkills>>,
        Awaited<ReturnType<typeof getRewards>>,
        Awaited<ReturnType<typeof getCertificates>>,
      ]
    >
  > | null = null;

  try {
    data = await Promise.all([
      getBio(),
      getWorkExperience(),
      getSideProjects(),
      getEducation(),
      getSkills(),
      getRewards(),
      getCertificates(),
    ]);
  } catch {
    data = null;
  }

  const bio = data?.[0] ?? null;

  if (!bio || !data) {
    return (
      <div className="home-mono flex min-h-dvh w-full items-center justify-center px-5 py-12">
        <main className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#111113] p-6 sm:p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Unable to load portfolio
          </h1>
          <p className="text-sm leading-relaxed text-zinc-400">
            The profile content could not be fetched from the CMS right now. Check your connection
            or Sanity environment settings, then try reloading the page.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <ReloadButton />
            <Link
              href="/services"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-[#676773] px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-white/40 hover:bg-white/[0.06]"
            >
              View Services
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const [, workExperience, sideProjects, education, skills, rewards, certificates] = data;

  const siteUrl = 'https://satriabmnyu.com';
  const currentJob = workExperience?.find((job) => job.isCurrent) ?? workExperience?.[0];
  const socialUrls = (bio.socialLinks ?? []).map((link) => link.url).filter(Boolean);
  const allSkills = (skills ?? []).flatMap((group) => group.skills ?? []).slice(0, 30);
  const personImage = bio.avatar
    ? urlFor(bio.avatar).width(512).height(512).fit('crop').auto('format').quality(85).url()
    : `${siteUrl}/satria-logo.png`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Satria Abimanyu Putra Wijayatama (Satriabmnyu)',
        alternateName: ['Satria Abimanyu', 'Satriabmnyu', 'satriabmnyu', 'Satria Portfolio'],
        description:
          'Official portfolio of Satria Abimanyu Putra Wijayatama (Satriabmnyu), Software Engineer and Full Stack Developer.',
        inLanguage: ['en', 'id'],
      },
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/#profilepage`,
        url: siteUrl,
        name: 'Satria Abimanyu Putra Wijayatama (Satriabmnyu) Portfolio',
        isPartOf: { '@id': `${siteUrl}/#website` },
        mainEntity: { '@id': `${siteUrl}/#person` },
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: 'Satria Abimanyu Putra Wijayatama',
        givenName: 'Satria',
        additionalName: 'Abimanyu Putra',
        familyName: 'Wijayatama',
        alternateName: ['Satria Abimanyu', 'Satriabmnyu', 'satriabmnyu', 'Satria'],
        url: siteUrl,
        image: personImage,
        jobTitle: bio.position || currentJob?.role || 'Software Engineer & Full Stack Developer',
        description: bio.description,
        ...(bio.email ? { email: `mailto:${bio.email}` } : {}),
        ...(bio.place ? { homeLocation: { '@type': 'Place', name: bio.place } } : {}),
        ...(currentJob?.company
          ? {
              worksFor: {
                '@type': 'Organization',
                name: currentJob.company,
                ...(currentJob.companyLink ? { url: currentJob.companyLink } : {}),
              },
            }
          : {}),
        ...(education && education.length > 0
          ? {
              alumniOf: education.map((ed) => ({
                '@type': 'EducationalOrganization',
                name: ed.institution,
              })),
            }
          : {}),
        ...(allSkills.length > 0 ? { knowsAbout: allSkills } : {}),
        ...(socialUrls.length > 0 ? { sameAs: socialUrls } : {}),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PortfolioContent
        bio={bio}
        workExperience={workExperience}
        sideProjects={sideProjects}
        education={education}
        skills={skills}
        rewards={rewards}
        certificates={certificates}
      />
    </>
  );
}
