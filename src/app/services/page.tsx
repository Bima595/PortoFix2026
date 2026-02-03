import { HeroSection } from './components/HeroSection';
import { BenefitsSection } from './components/BenefitsSection';
import { MottoSection } from './components/MottoSection';
import { ProjectsFieldsSection } from './components/ProjectsFieldsSection';
import { ProcessSection } from './components/ProcessSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { getSideProjects, getStats, getProjects, getFields, getPricing, getBio } from '@/lib/sanity/api';
import { ServicesDock } from './components/ServicesDock';
import { ContactCTASection } from './components/ContactCTASection';

export default async function ServicesPage() {
  // Fetch all data from Sanity CMS
  const [sideProjects, stats, projects, fields, pricing, bio] = await Promise.all([
    getSideProjects(),
    getStats(),
    getProjects(),
    getFields(),
    getPricing(),
    getBio(),
  ]);

  return (
    <div className="relative min-h-screen w-full">
      {/* Dock Navigation */}
      <ServicesDock />

      {/* Hero Section with Image Slider */}
      <HeroSection projects={sideProjects} />
      
      {/* Benefits Section */}
      <BenefitsSection />

      {/* Motto & Stats Section */}
      <MottoSection stats={stats} />

      {/* Projects & Fields Section */}
      <ProjectsFieldsSection projects={projects} fields={fields} />

      {/* Process/Approach Section */}
      <ProcessSection />

      {/* Pricing Section */}
      <PricingSection plans={pricing} userEmail={bio?.email || 'your-email@example.com'} />

      {/* FAQ Section */}
      <FAQSection />

      {/* Contact & Footer Section */}
      <ContactCTASection />
    </div>
  );
}
