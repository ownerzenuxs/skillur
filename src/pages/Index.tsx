
import { Hero } from '@/components/Hero';
import { SubjectsSection } from '@/components/SubjectsSection';
import { Features } from '@/components/Features';
import { DevelopersSection } from '@/components/DevelopersSection';
import { PremiumPlans } from '@/components/PremiumPlans';
import { Navbar } from '@/components/Navbar';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div id="hero">
        <Hero />
      </div>
      <SubjectsSection />
      <Features />
      <DevelopersSection />
      <PremiumPlans />
    </div>
  );
};

export default Index;
