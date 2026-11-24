'use client';

import { Camera, Home, Users } from 'lucide-react';
import { MotionConfig } from 'motion/react';
import { useRouter } from 'next/navigation';
import Dock from '@/components/Dock';
import { BioSection } from '@/components/portfolio/BioSection';
import { WorkExperienceSection } from '@/components/portfolio/WorkExperienceSection';
import { SideProjectsSection } from '@/components/portfolio/SideProjectsSection';
import { EducationSection } from '@/components/portfolio/EducationSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { RewardsSection } from '@/components/portfolio/RewardsSection';
import { CertificatesSection } from '@/components/portfolio/CertificatesSection';
import { LinksSection } from '@/components/portfolio/LinksSection';
import type {
  Bio,
  WorkExperience,
  SideProject,
  Education,
  Skill,
  Reward,
  Certificate,
} from '@/types/portfolio';

interface PortfolioContentProps {
  bio: Bio;
  workExperience: WorkExperience[];
  sideProjects: SideProject[];
  education: Education[];
  skills: Skill[];
  rewards: Reward[];
  certificates: Certificate[];
}

export function PortfolioContent({
  bio,
  workExperience,
  sideProjects,
  education,
  skills,
  rewards,
  certificates,
}: PortfolioContentProps) {
  const router = useRouter();
  const hasLinks = Boolean(bio.socialLinks && bio.socialLinks.length > 0);
  const hasProjects = Boolean(sideProjects && sideProjects.length > 0);
  const currentJob = workExperience?.find((job) => job.isCurrent) ?? null;

  const dockItems = [
    {
      icon: <Home className="h-5 w-5 text-zinc-100" aria-hidden="true" />,
      label: 'Home',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      icon: <Users className="h-5 w-5 text-zinc-400" aria-hidden="true" />,
      label: 'My Services',
      onClick: () => {
        router.push('/services');
      },
    },
    {
      icon: <Camera className="h-5 w-5 text-zinc-400" aria-hidden="true" />,
      label: 'Photo Booth',
      onClick: () => {
        router.push('/photobooth');
      },
    },
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div id="top" className="home-mono relative min-h-dvh w-full">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-zinc-950"
        >
          Skip to main content
        </a>

        <main
          id="main-content"
          tabIndex={-1}
          className="relative z-10 mx-auto w-full max-w-5xl px-5 pt-10 pb-36 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:px-8 sm:pt-16 sm:pb-40 lg:px-10"
        >
          <BioSection bio={bio} hasProjects={hasProjects} currentJob={currentJob} />

          <div className="mt-20 space-y-24 sm:mt-28 sm:space-y-28">
            <WorkExperienceSection workExperience={workExperience} indexLabel="01" />

            <SideProjectsSection sideProjects={sideProjects} indexLabel="02" />

            <div className="grid grid-cols-1 gap-14 border-t border-white/10 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-7">
                <EducationSection education={education} indexLabel="03" />
              </div>
              <div className="border-t border-white/10 pt-12 lg:col-span-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
                <RewardsSection rewards={rewards} indexLabel="04" />
              </div>
            </div>

            <SkillsSection skills={skills} indexLabel="05" />

            <CertificatesSection certificates={certificates} indexLabel="06" />

            {hasLinks && <LinksSection socialLinks={bio.socialLinks} indexLabel="07" />}
          </div>
        </main>

        {/* Floating Bottom Dock Navigation (consistent with /services) */}
        <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-40 pb-[env(safe-area-inset-bottom)]">
          <div className="pointer-events-auto">
            <Dock items={dockItems} />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
