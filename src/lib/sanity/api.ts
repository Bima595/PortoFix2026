import { client } from '@/sanity/lib/client';
import {
  bioQuery,
  workExperienceQuery,
  rewardQuery,
  sideProjectQuery,
  singleSideProjectQuery,
  educationQuery,
  certificateQuery,
  skillQuery,
  statsQuery,
  projectQuery,
  fieldQuery,
  pricingQuery,
  photoboothTemplateQuery,
} from './queries';
import type {
  Bio,
  WorkExperience,
  Reward,
  SideProject,
  Education,
  Certificate,
  Skill,
  PhotoboothTemplate,
} from '@/types/portfolio';

export async function getBio(): Promise<Bio | null> {
  return client.fetch(bioQuery, {}, { next: { revalidate: 60 } });
}

export async function getWorkExperience(): Promise<WorkExperience[]> {
  return client.fetch(workExperienceQuery, {}, { next: { revalidate: 60 } });
}

export async function getRewards(): Promise<Reward[]> {
  return client.fetch(rewardQuery, {}, { next: { revalidate: 60 } });
}

export async function getSideProjects(): Promise<SideProject[]> {
  return client.fetch(sideProjectQuery, {}, { next: { revalidate: 60 } });
}

export async function getEducation(): Promise<Education[]> {
  return client.fetch(educationQuery, {}, { next: { revalidate: 60 } });
}

export async function getCertificates(): Promise<Certificate[]> {
  return client.fetch(certificateQuery, {}, { next: { revalidate: 60 } });
}

export async function getSkills(): Promise<Skill[]> {
  return client.fetch(skillQuery, {}, { next: { revalidate: 60 } });
}

export async function getStats() {
  return client.fetch(statsQuery, {}, { next: { revalidate: 60 } });
}

export async function getProjects() {
  return client.fetch(projectQuery, {}, { next: { revalidate: 60 } });
}

export async function getFields() {
  return client.fetch(fieldQuery, {}, { next: { revalidate: 60 } });
}

export async function getPricing() {
  return client.fetch(pricingQuery, {}, { next: { revalidate: 60 } });
}

export async function getPhotoboothTemplates(): Promise<PhotoboothTemplate[]> {
  return client.fetch(photoboothTemplateQuery, {}, { next: { revalidate: 60 } });
}

export async function getSideProjectById(id: string): Promise<SideProject | null> {
  return client.fetch(singleSideProjectQuery, { id }, { next: { revalidate: 60 } });
}
