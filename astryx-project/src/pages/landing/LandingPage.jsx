import React, { useEffect } from 'react';
import { VStack } from '@astryxdesign/core/VStack';
import { LandingNav } from './LandingNav';
import { HeroSection } from './HeroSection';
import { SmartphoneShowcaseSection } from './SmartphoneShowcaseSection';
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

  // Scroll reveal IntersectionObserver
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // If user prefers reduced motion or IntersectionObserver is not supported, reveal all immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.ojt-reveal-on-scroll').forEach((el) => {
        el.classList.add('ojt-revealed');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ojt-revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    const elements = document.querySelectorAll('.ojt-reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="ojt-landing-root">
      <VStack gap={0}>
        <LandingNav onRegister={handleRegister} onLogin={handleLogin} />
        <HeroSection onRegister={handleRegister} />
        <SmartphoneShowcaseSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection onRegister={handleRegister} />
        <FooterSection onRegister={handleRegister} onLogin={handleLogin} />
      </VStack>
    </div>
  );
}
