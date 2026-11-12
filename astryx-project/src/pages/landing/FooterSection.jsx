import React from 'react';
import { Section } from '@astryxdesign/core/Section';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { StackItem } from '@astryxdesign/core/Stack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Icon } from '@astryxdesign/core/Icon';
import { GraduationCapIcon } from '../../components/common/BrandIcons';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
];

const CURRENT_YEAR = new Date().getFullYear();

export function FooterSection({ onRegister, onLogin }) {
  const scrollTo = (href) => (e) => {
    e.preventDefault();
    document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Section variant="transparent" dividers={['top']} paddingBlock={8} paddingInline={6}>
      <div className="ojt-landing-container">
        <VStack gap={8}>
          {/* Top row */}
          <HStack gap={8} align="start" wrap="wrap">
            {/* Brand block */}
            <StackItem size="fill">
              <VStack gap={3}>
                <HStack gap={2} align="center">
                  <Icon icon={GraduationCapIcon} size="sm" color="accent" />
                  <Heading level={3}>OJT Tracker</Heading>
                </HStack>
                <Text type="body" color="secondary" maxWidth={400}>
                  A simple, modern tool for student interns to record daily training
                  hours and track progress toward their required OJT completion.
                </Text>
              </VStack>
            </StackItem>

            {/* Navigation links */}
            <StackItem size="static">
              <VStack gap={3}>
                <Text weight="semibold" size="sm">Navigation</Text>
                <VStack gap={1} align="start">
                  {NAV_LINKS.map(({ label, href }) => (
                    <Button
                      key={label}
                      label={label}
                      variant="ghost"
                      size="sm"
                      onClick={scrollTo(href)}
                    />
                  ))}
                </VStack>
              </VStack>
            </StackItem>

            {/* Account links */}
            <StackItem size="static">
              <VStack gap={3}>
                <Text weight="semibold" size="sm">Account</Text>
                <VStack gap={1} align="start">
                  <Button
                    label="Login"
                    variant="ghost"
                    size="sm"
                    onClick={onLogin}
                  />
                  <Button
                    label="Get Started"
                    variant="ghost"
                    size="sm"
                    onClick={onRegister}
                  />
                </VStack>
              </VStack>
            </StackItem>
          </HStack>

          <Divider variant="subtle" />

          {/* Bottom copyright */}
          <HStack justify="between" wrap="wrap" gap={2}>
            <Text type="supporting" color="secondary" size="sm">
              © {CURRENT_YEAR} OJT Tracker. Built for students.
            </Text>
            <Text type="supporting" color="secondary" size="sm">
              All rights reserved.
            </Text>
          </HStack>
        </VStack>
      </div>
    </Section>
  );
}
