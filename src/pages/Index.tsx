
import React from 'react';
import LandingHeader from './index/LandingHeader';
import HeroSection from './index/HeroSection';
import TrustedBySection from './index/TrustedBySection';
import FeaturesSection from './index/FeaturesSection';
import HowItWorksSection from './index/HowItWorksSection';
import UseCasesSection from './index/UseCasesSection';
import CtaSection from './index/CtaSection';
import SiteFooter from './index/SiteFooter';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHeader />
      <main>
        <HeroSection />
        <TrustedBySection />
        <FeaturesSection />
        <HowItWorksSection />
        <UseCasesSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
