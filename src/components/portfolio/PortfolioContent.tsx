'use client';

import { Home, Users, } from 'lucide-react';
import Dock from '@/components/Dock';
import { BioSection } from '@/components/portfolio/BioSection';
import { AboutSection } from '@/components/portfolio/AboutSection';
import { WorkExperienceSection } from '@/components/portfolio/WorkExperienceSection';
import { SideProjectsSection } from '@/components/portfolio/SideProjectsSection';
import { EducationSection } from '@/components/portfolio/EducationSection';
import { SkillsSection } from '@/components/portfolio/SkillsSection';
import { RewardsSection } from '@/components/portfolio/RewardsSection';
import { CertificatesSection } from '@/components/portfolio/CertificatesSection';
import { LinksSection } from '@/components/portfolio/LinksSection';
import type { Bio, WorkExperience, SideProject, Education, Skill, Reward, Certificate } from '@/types/portfolio';

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
  const dockItems = [
    {
      icon: <Home className="w-5 h-5 text-zinc-400" />,
      label: 'Home',
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      icon: <Users className="w-5 h-5 text-zinc-400" />,
      label: 'My Services',
      onClick: () => {
        window.location.href = '/services';
      },
    },
    // {
    //   icon: <Camera className="w-5 h-5 text-zinc-400" />,
    //   label: 'Photo Booth',
    //   onClick: () => {
    //     window.location.href = '/photobooth';
    //   },
    // },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <main className="relative z-10 w-full max-w-xl mx-auto min-h-screen flex flex-col justify-start md:justify-center items-start py-8 md:py-20 px-6 md:px-0">
        <div className="flex flex-col gap-6 md:gap-12 text-zinc-100 w-full">
          <BioSection bio={bio} />
          <AboutSection description={bio.description} />
          <WorkExperienceSection workExperience={workExperience} />
          <SideProjectsSection sideProjects={sideProjects} />
          <EducationSection education={education} />
          <SkillsSection skills={skills} />
          <RewardsSection rewards={rewards} />
          <CertificatesSection certificates={certificates} />
          <LinksSection socialLinks={bio.socialLinks} />
        </div>
      </main>

      {/* Dock Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <Dock items={dockItems} />
        </div>
      </div>
    </div>
  );
}
