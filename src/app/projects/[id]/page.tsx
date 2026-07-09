import { getSideProjectById } from '@/lib/sanity/api';
import { notFound } from 'next/navigation';
import { ProjectDetailsClient } from '../components/ProjectDetailsClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getSideProjectById(id);
  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }
  return {
    title: `${project.name} — Project Details`,
    description: project.description || `Explore the design, tech stack, and screenshots of ${project.name}.`,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getSideProjectById(id);

  if (!project) {
    notFound();
  }

  return <ProjectDetailsClient project={project} />;
}
