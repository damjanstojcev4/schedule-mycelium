import { Navbar } from '@/components/marketing/Navbar';
import { Hero } from '@/components/marketing/Hero';
import { ProblemSection } from '@/components/marketing/ProblemSection';
import { ProductShowcase } from '@/components/marketing/ProductShowcase';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { BusinessTypes } from '@/components/marketing/BusinessTypes';
import { Features } from '@/components/marketing/Features';
import { Pricing } from '@/components/marketing/Pricing';
import { EarlyAccess } from '@/components/marketing/EarlyAccess';
import { FAQ } from '@/components/marketing/FAQ';
import { FinalCTA } from '@/components/marketing/FinalCTA';
import { Footer } from '@/components/marketing/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <ProblemSection />
        <ProductShowcase />
        <HowItWorks />
        <BusinessTypes />
        <Features />
        <Pricing />
        <EarlyAccess />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
