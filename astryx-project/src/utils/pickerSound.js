/**
 * Subtle synthesized mechanical audio click for iOS-style wheel picker
 * Uses Web Audio API with zero external audio assets.
 */

let audioCtx = null;
let isSoundEnabled = null;

export function getSoundEnabled() {
  if (isSoundEnabled !== null) return isSoundEnabled;
  try {
    const stored = localStorage.getItem('ojt_picker_sound_enabled');
    if (stored !== null) {
      isSoundEnabled = stored === 'true';
      return isSoundEnabled;
    }
  } catch {
    // fallback
  }
  isSoundEnabled = true; // Default enabled per requirements
  return true;
}

export function setSoundEnabled(enabled) {
  isSoundEnabled = Boolean(enabled);
  try {
    localStorage.setItem('ojt_picker_sound_enabled', String(isSoundEnabled));
  } catch {
    // fallback
  }
}

let lastTickTime = 0;

/**
 * Plays a short, soft, professional iOS-like ticking sound.
 * Throttled to prevent overlapping machine-gun sounds during fast momentum scrolling.
 */
export function playPickerTick() {
  if (!getSoundEnabled()) return;
  if (typeof window === 'undefined') return;

  const now = performance.now();
  // Throttle to 38ms to prevent audio clipping during rapid fling
  if (now - lastTickTime < 38) return;
  lastTickTime = now;

  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Soft mechanical tick (1150Hz -> 480Hz in 12ms)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1150, t);
    osc.frequency.exponentialRampToValueAtTime(480, t + 0.012);

    // Subtle gentle volume (0.035 amplitude)
    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.014);
  } catch {
    // Fail silently if browser audio policy blocks or AudioContext is unavailable
  }
}

