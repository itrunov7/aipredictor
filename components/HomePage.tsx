'use client';

import React from 'react';
import { ChevronRightIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { FreeInsightsSection } from './FreeInsightsSection';
import { FeaturesSection } from './FeaturesSection';
import { TestimonialsSection } from './TestimonialsSection';

import { EnhancedFooter } from './EnhancedFooter';

export function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50">
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Free Insights Showcase */}
      <FreeInsightsSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Social Proof / Testimonials */}
      <TestimonialsSection />
      
      {/* Footer */}
      <EnhancedFooter />
    </div>
  );
} 