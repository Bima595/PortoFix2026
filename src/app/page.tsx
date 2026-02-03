import { PortfolioContent } from '@/components/portfolio/PortfolioContent';
import { getBio, getWorkExperience, getSideProjects, getEducation, getSkills, getRewards, getCertificates } from '@/lib/sanity/api';

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
    return null;
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
