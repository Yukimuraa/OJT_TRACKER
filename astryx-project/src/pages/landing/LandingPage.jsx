import React from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { CTASection } from './CTASection';
import { FooterSection } from './FooterSection';

/**
 * Public landing page — Light SaaS theme with Deep Navy typography,
 * Emerald accents, and clean white & light slate section backgrounds.
 */
export function LandingPage({ onEnterApp, onNavigate }) {
  const handleRegister = () => onNavigate ? onNavigate('register') : onEnterApp?.();
  const handleLogin = () => onNavigate ? onNavigate('login') : onEnterApp?.();

  return (
    <div className="ojt-landing-root">
      <VStack gap={0}>
        <LandingNav onRegister={handleRegister} onLogin={handleLogin} />
        <HeroSection onRegister={handleRegister} />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection onRegister={handleRegister} />
        <FooterSection onRegister={handleRegister} onLogin={handleLogin} />
      </VStack>
    </div>
  );
}
