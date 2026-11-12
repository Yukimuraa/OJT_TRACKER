import { useCallback, useEffect, useState } from 'react';

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  const standaloneQuery = window.matchMedia?.('(display-mode: standalone)')?.matches;
  const fullscreenQuery = window.matchMedia?.('(display-mode: fullscreen)')?.matches;
  const minimalUiQuery = window.matchMedia?.('(display-mode: minimal-ui)')?.matches;
  const iosStandalone = Boolean(window.navigator?.standalone);
  const androidTwa = typeof document !== 'undefined' && document.referrer.includes('android-app://');
  return Boolean(standaloneQuery || fullscreenQuery || minimalUiQuery || iosStandalone || androidTwa);
}

function getInstallInstructions() {
  if (typeof navigator === 'undefined') {
    return 'Open this site in Chrome or Edge to install OJT Hours Tracker.';
  }

  const ua = navigator.userAgent || '';
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);
  const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua);
  const isFirefox = /Firefox/i.test(ua);

  if (isIos) {
    return 'On iPhone or iPad, open this site in Safari, tap the Share button, then choose Add to Home Screen.';
  }
  if (isAndroid) {
    return 'On Android, open this site in Chrome, tap the menu, then choose Install app or Add to Home screen.';
  }
  if (isSafari || isFirefox) {
    return 'This browser does not support the install prompt. Use Chrome or Edge on this computer, or add the site to your home screen from the browser menu.';
  }
  return 'Use the install icon in the Chrome or Edge address bar, or open the browser menu and choose Install OJT Hours Tracker.';
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(isStandaloneDisplay);
  const [installOutcome, setInstallOutcome] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setInstallOutcome('accepted');
    };

    const media = window.matchMedia?.('(display-mode: standalone)');
    const handleDisplayChange = () => setIsInstalled(isStandaloneDisplay());

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleInstalled);
    media?.addEventListener?.('change', handleDisplayChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleInstalled);
      media?.removeEventListener?.('change', handleDisplayChange);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return { ok: false, reason: 'unsupported' };

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setInstallOutcome(choice.outcome);
    if (choice.outcome === 'accepted') {
      setIsInstalled(true);
    }
    return { ok: choice.outcome === 'accepted', reason: choice.outcome };
  }, [deferredPrompt]);

  return {
    canPrompt: Boolean(deferredPrompt) && !isInstalled,
    isInstalled,
    isInstallSupported: typeof window !== 'undefined' && 'BeforeInstallPromptEvent' in window,
    installOutcome,
    instructions: getInstallInstructions(),
    promptInstall,
  };
}
