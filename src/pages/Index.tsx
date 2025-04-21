
import React from 'react';
import Header from '@/components/Header';
import HeroSection from './index/HeroSection';
import FeaturesSection from './index/FeaturesSection';
import CtaSection from './index/CtaSection';
import SiteFooter from './index/SiteFooter';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
