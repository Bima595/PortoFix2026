import { PortfolioContent } from '@/components/portfolio/PortfolioContent';
import { getBio, getWorkExperience, getSideProjects, getEducation, getSkills, getRewards, getCertificates } from '@/lib/sanity/api';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function Home() {
  const [bio, workExperience, sideProjects, education, skills, rewards, certificates] = await Promise.all([
    getBio(),
    getWorkExperience(),
    getSideProjects(),
    getEducation(),
    getSkills(),
    getRewards(),
    getCertificates(),
  ]);

  if (!bio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-semibold mb-2 text-zinc-200">Something went wrong</h2>
        <p className="text-zinc-400 mb-4">Could not load profile data. Please try again later.</p>
        <Link 
          href="/" 
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors"
        >
          Retry
        </Link>
      </div>
    );
  }

  return (
    <PortfolioContent
      bio={bio}
      workExperience={workExperience}
      sideProjects={sideProjects}
      education={education}
      skills={skills}
      rewards={rewards}
      certificates={certificates}
    />
  );
}
