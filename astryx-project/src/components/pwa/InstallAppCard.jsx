import React, { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Divider } from '@astryxdesign/core/Divider';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { Banner } from '@astryxdesign/core/Banner';
import { usePwaInstall } from '../../hooks/usePwaInstall';

export function InstallAppCard() {
  const { canPrompt, isInstalled, instructions, promptInstall } = usePwaInstall();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleInstallClick = async () => {
    if (isInstalled) return;

    if (canPrompt) {
      const result = await promptInstall();
      if (result.reason === 'accepted') {
        setFeedback({ type: 'success', message: 'OJT Hours Tracker was added to this device.' });
      } else if (result.reason === 'dismissed') {
        setFeedback({ type: 'info', message: 'Installation was cancelled.' });
      }
      return;
    }

    setIsHelpOpen(true);
  };

  return (
    <>
      <Card elevation="low" padding={5}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={3}>Install App</Heading>
            <Text type="supporting" color="secondary">
              Add OJT Hours Tracker to your home screen or desktop for a standalone window, app icon, and faster return visits.
            </Text>
          </VStack>

          <Divider variant="subtle" />

          {feedback && (
            <Banner
              status={feedback.type === 'success' ? 'success' : 'info'}
              title={feedback.message}
              isDismissable
              onDismiss={() => setFeedback(null)}
            />
          )}

          <VStack gap={2}>
            <Text size="sm" color="secondary">
              {isInstalled
                ? 'This session is already running as an installed application.'
                : canPrompt
                  ? 'Your browser can install this app. Choose Install App to open the system prompt.'
                  : instructions}
            </Text>
            <HStack>
              <Button
                label={isInstalled ? 'Installed' : 'Install App'}
                variant="primary"
                className="ojt-btn-black"
                isDisabled={isInstalled}
                onClick={handleInstallClick}
              />
            </HStack>
          </VStack>
        </VStack>
      </Card>

      <Dialog isOpen={isHelpOpen} onOpenChange={setIsHelpOpen} purpose="info" width={460}>
        <DialogHeader
          title="Install OJT Hours Tracker"
          subtitle="This browser is not showing a native install prompt."
          onOpenChange={setIsHelpOpen}
        />
        <VStack gap={4} padding={4}>
          <Text type="body" color="secondary">
            {instructions}
          </Text>
          <HStack gap={2} justify="end">
            <Button label="Close" variant="secondary" onClick={() => setIsHelpOpen(false)} />
          </HStack>
        </VStack>
      </Dialog>
    </>
  );
}
