import React, { useState, useEffect } from 'react';
import { TopNav, TopNavHeading, TopNavItem } from '@astryxdesign/core/TopNav';
import { Button } from '@astryxdesign/core/Button';
import { HStack } from '@astryxdesign/core/HStack';
import { Icon } from '@astryxdesign/core/Icon';
import { GraduationCapIcon } from '../../components/common/BrandIcons';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
];

export function LandingNav({ onRegister, onLogin }) {
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'features', 'how-it-works', 'about'];
      let current = 'home';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 100) {
          current = id;
        }
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (href) => (e) => {
    e.preventDefault();
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <TopNav
      label="OJT Tracker public navigation"
      heading={
        <TopNavHeading
          heading="OJT Tracker"
          headingHref="#home"
          logo={<Icon icon={GraduationCapIcon} size="sm" color="accent" />}
        />
      }
      centerContent={
        <HStack gap={1}>
          {NAV_LINKS.map(({ label, href }) => (
            <TopNavItem
              key={label}
              label={label}
              href={href}
              isSelected={activeSection === href.replace('#', '')}
              as="a"
              onClick={handleNavClick(href)}
            />
          ))}
        </HStack>
      }
      endContent={
        <HStack gap={2} align="center">
          <Button
            label="Login"
            variant="ghost"
            size="sm"
            onClick={onLogin}
          />
          <Button
            label="Get Started"
            variant="primary"
            size="sm"
            onClick={onRegister}
          />
        </HStack>
      }
    />
  );
}
