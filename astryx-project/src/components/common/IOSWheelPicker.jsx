import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { playPickerTick } from '../../utils/pickerSound.js';

const ITEM_HEIGHT = 44;
const WHEEL_HEIGHT = 184;
const PADDING_Y = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2; // 70px exact center alignment

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ['AM', 'PM'];

/**
 * Converts 24-hour HH:MM string to 12-hour parts { hour, minute, period }.
 */
function parse24HourTime(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') {
    return { hour: 8, minute: 0, period: 'AM' };
  }
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  if (isNaN(h)) h = 8;
  if (isNaN(m)) m = 0;

  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;

  return { hour: hour12, minute: m, period };
}

/**
 * Converts 12-hour parts { hour, minute, period } to 24-hour HH:MM string.
 */
function to24HourString(hour, minute, period) {
  let h = hour;
  if (period === 'AM') {
    if (h === 12) h = 0;
  } else {
    if (h !== 12) h += 12;
  }
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * Single Apple iOS-Style Wheel Drum Column in Navy + Emerald Light Theme.
 * Reliably synchronizes initial scroll on modal mount and renders high-contrast, fully visible numbers.
 */
function IOSDrumColumn({
  items,
  selectedValue,
  onSelect,
  formatItem = (v) => String(v),
  label,
  width = 68,
}) {
  const containerRef = useRef(null);
  const selectedIndex = items.indexOf(selectedValue);
  const targetIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Active center index tracked for visual feedback
  const [centerIndex, setCenterIndex] = useState(targetIndex);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const userInteractedRef = useRef(false);
  const isProgrammaticRef = useRef(false);
  const scrollTimeoutRef = useRef(null);
  const lastTickIndexRef = useRef(targetIndex);

  // Synchronous initial and update alignment
  useLayoutEffect(() => {
    const targetTop = targetIndex * ITEM_HEIGHT;
    lastTickIndexRef.current = targetIndex;

    const align = () => {
      if (!containerRef.current) return;
      if (Math.abs(containerRef.current.scrollTop - targetTop) > 1) {
        isProgrammaticRef.current = true;
        containerRef.current.scrollTop = targetTop;
        requestAnimationFrame(() => {
          isProgrammaticRef.current = false;
        });
      }
    };

    align();
    const r1 = requestAnimationFrame(align);
    const r2 = requestAnimationFrame(() => requestAnimationFrame(align));
    const timerIds = [20, 50, 100, 180, 250, 350, 500].map((delay) =>
      setTimeout(align, delay)
    );

    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      timerIds.forEach(clearTimeout);
    };
  }, [targetIndex]);

  // ResizeObserver to ensure proper scroll alignment when modal finishes DOM rendering
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.height > 50) {
          const targetTop = targetIndex * ITEM_HEIGHT;
          if (containerRef.current && Math.abs(containerRef.current.scrollTop - targetTop) > 1) {
            isProgrammaticRef.current = true;
            containerRef.current.scrollTop = targetTop;
            requestAnimationFrame(() => {
              isProgrammaticRef.current = false;
            });
          }
        }
      }
    });

    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [targetIndex]);

  const markUserInteraction = () => {
    userInteractedRef.current = true;
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.currentTarget.scrollTop;
    const rawIndex = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(items.length - 1, rawIndex));

    // Update active index feedback on every scroll
    if (clampedIndex !== lastTickIndexRef.current) {
      lastTickIndexRef.current = clampedIndex;
      if (userInteractedRef.current) {
        playPickerTick();
      }
      setCenterIndex(clampedIndex);
    }

    if (isProgrammaticRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      // Only trigger onSelect if user explicitly interacted with wheel (prevents false overwrites on mount)
      if (userInteractedRef.current && items[clampedIndex] !== selectedValue) {
        onSelect(items[clampedIndex]);
      }
    }, 50);
  };

  const handleKeyDown = (e) => {
    markUserInteraction();
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = Math.max(0, targetIndex - 1);
      onSelect(items[prev]);
      playPickerTick();
      containerRef.current?.scrollTo({ top: prev * ITEM_HEIGHT, behavior: 'smooth' });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(items.length - 1, targetIndex + 1);
      onSelect(items[next]);
      playPickerTick();
      containerRef.current?.scrollTo({ top: next * ITEM_HEIGHT, behavior: 'smooth' });
    }
  };

  const handleItemClick = (index, val) => {
    markUserInteraction();
    onSelect(val);
    playPickerTick();
    containerRef.current?.scrollTo({
      top: index * ITEM_HEIGHT,
      behavior: 'smooth',
    });
  };

  // Always derive the active display index from targetIndex (the source of truth from props).
  // centerIndex is only used while the user is actively scrolling (hasUserInteracted=true).
  // This ensures the picker ALWAYS shows the correct highlighted value on open.
  const activeFocusIndex = hasUserInteracted ? centerIndex : targetIndex;

  return (
    <div
      style={{
        width,
        height: WHEEL_HEIGHT,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onWheel={markUserInteraction}
      onTouchStart={markUserInteraction}
      onMouseDown={markUserInteraction}
    >
      <div
        ref={containerRef}
        className="ios-wheel-column"
        tabIndex={0}
        role="listbox"
        aria-label={label}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        style={{
          width: '100%',
          height: '100%',
          overflowY: 'auto',
          paddingTop: PADDING_Y,
          paddingBottom: PADDING_Y,
          outline: 'none',
          cursor: 'grab',
          position: 'relative',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          scrollSnapType: 'y mandatory',
        }}
      >
        {items.map((item, idx) => {
          const distance = Math.abs(idx - activeFocusIndex);
          // An item is "selected" if it matches the current selectedValue prop OR
          // it is the center index while scrolling. Always force full opacity/bold navy
          // for the actual selectedValue regardless of centerIndex state.
          const isExactMatch = item === selectedValue;
          const isCenterActive = distance === 0;
          const isSelected = isExactMatch || isCenterActive;

          // High-contrast, easily visible light theme typography
          let opacity;
          let scale;
          let fontWeight;
          let color;

          if (isExactMatch && !hasUserInteracted) {
            // Guaranteed full visibility for the default/prop value before any interaction
            opacity = 1;
            scale = 1.08;
            fontWeight = 800;
            color = '#142b49';
          } else if (isSelected) {
            opacity = 1;
            scale = 1.08;
            fontWeight = 800;
            color = '#142b49'; // Bold Deep Navy for selected item
          } else if (distance === 1) {
            opacity = 0.75;
            scale = 0.96;
            fontWeight = 600;
            color = '#334155'; // High-contrast dark slate
          } else if (distance === 2) {
            opacity = 0.55;
            scale = 0.90;
            fontWeight = 500;
            color = '#475569'; // Slate gray
          } else {
            opacity = 0.38;
            scale = 0.85;
            fontWeight = 500;
            color = '#64748b'; // Visible secondary slate (never invisible)
          }

          return (
            <div
              key={item}
              className="ios-wheel-item"
              role="option"
              aria-selected={isSelected}
              onClick={() => handleItemClick(idx, item)}
              style={{
                height: ITEM_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight,
                color,
                opacity,
                transform: `scale(${scale})`,
                transition: 'opacity 0.1s ease, transform 0.1s ease, color 0.1s ease',
                cursor: 'pointer',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '0.02em',
                userSelect: 'none',
                scrollSnapAlign: 'center',
              }}
            >
              {formatItem(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Clock Icon SVG helper in light neutral color
 */
function ClockIcon({ size = 13, color = '#64748b' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

/**
 * Apple iOS-Style Inline Wheel Time Picker (Navy + Emerald Light Theme)
 *
 * Features:
 * - High-contrast readable numbers in Deep Navy (#142b49)
 * - Emerald tinted selection capsule: rgba(16, 185, 129, 0.12)
 * - Auto PM option for Morning Time Out: noon (12:00) automatically defaults to PM
 * - Unobscured center viewing window with soft edge fades
 */
export function IOSInlineTimePicker({
  label = 'TIME IN',
  value = '08:00',
  onChange,
  disabled = false,
  autoPmOn12 = false,
}) {
  const { hour, minute, period } = parse24HourTime(value);

  const handleHourChange = (newHour) => {
    let nextPeriod = period;
    // For morning time out: 12:00 is noon, so it automatically switches to PM
    if (autoPmOn12 && newHour === 12) {
      nextPeriod = 'PM';
    }
    const updated = to24HourString(newHour, minute, nextPeriod);
    onChange?.(updated);
  };

  const handleMinuteChange = (newMinute) => {
    const updated = to24HourString(hour, newMinute, period);
    onChange?.(updated);
  };

  const handlePeriodChange = (newPeriod) => {
    // If autoPmOn12 and hour is 12, keep PM for noon
    let effectivePeriod = newPeriod;
    if (autoPmOn12 && hour === 12) {
      effectivePeriod = 'PM';
    }
    const updated = to24HourString(hour, minute, effectivePeriod);
    onChange?.(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, opacity: disabled ? 0.45 : 1 }}>
      {/* Header Label: Clock icon + TIME IN / TIME OUT */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 11,
          fontWeight: 700,
          color: '#64748b',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          paddingLeft: 4,
        }}
      >
        <ClockIcon size={13} color="#64748b" />
        <span>{label}</span>
      </div>

      {/* Main Light Card Container (White surface, Navy accents, Emerald highlights) */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: '12px 14px 10px 14px',
          boxShadow: '0 2px 10px rgba(20, 43, 73, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
          border: '1.5px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          userSelect: 'none',
        }}
      >
        {/* Column Headers: HR, MIN, AM/PM */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 260,
            paddingBottom: 4,
          }}
        >
          <div style={{ width: 68, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
            HR
          </div>
          <div style={{ width: 20 }} />
          <div style={{ width: 68, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
            MIN
          </div>
          <div style={{ width: 14 }} />
          <div style={{ width: 72, textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#64748b', letterSpacing: '0.06em' }}>
            AM/PM
          </div>
        </div>

        {/* Wheels Container with Emerald Capsule Highlights */}
        <div
          style={{
            position: 'relative',
            height: WHEEL_HEIGHT,
            width: '100%',
            maxWidth: 260,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Center Selector Capsule Highlights & Colon */}
          <div
            style={{
              position: 'absolute',
              top: PADDING_Y,
              left: 0,
              right: 0,
              height: ITEM_HEIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* HR Capsule Pill */}
            <div
              style={{
                width: 68,
                height: ITEM_HEIGHT,
                borderRadius: 12,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid rgba(16, 185, 129, 0.40)',
              }}
            />

            {/* Colon Separator */}
            <div
              style={{
                width: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#142b49',
                fontWeight: 800,
                fontSize: 20,
                lineHeight: 1,
              }}
            >
              :
            </div>

            {/* MIN Capsule Pill */}
            <div
              style={{
                width: 68,
                height: ITEM_HEIGHT,
                borderRadius: 12,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid rgba(16, 185, 129, 0.40)',
              }}
            />

            <div style={{ width: 14 }} />

            {/* AM/PM Capsule Pill */}
            <div
              style={{
                width: 72,
                height: ITEM_HEIGHT,
                borderRadius: 12,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid rgba(16, 185, 129, 0.40)',
              }}
            />
          </div>

          {/* Soft Top & Bottom Edge Gradient Fade (Center viewing area is 100% transparent and unobscured) */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 3,
              background:
                'linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(255, 255, 255, 0) 28%, rgba(255, 255, 255, 0) 72%, rgba(255, 255, 255, 0.88) 100%)',
            }}
          />

          {/* 3 Wheel Columns */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {/* Hour Wheel */}
            <IOSDrumColumn
              items={HOURS}
              selectedValue={hour}
              onSelect={handleHourChange}
              label="Hour"
              formatItem={(h) => String(h).padStart(2, '0')}
              width={68}
            />

            {/* Colon placeholder space */}
            <div style={{ width: 20 }} />

            {/* Minute Wheel (1-minute steps) */}
            <IOSDrumColumn
              items={MINUTES}
              selectedValue={minute}
              onSelect={handleMinuteChange}
              label="Minute"
              formatItem={(m) => String(m).padStart(2, '0')}
              width={68}
            />

            <div style={{ width: 14 }} />

            {/* AM / PM Wheel */}
            <IOSDrumColumn
              items={PERIODS}
              selectedValue={period}
              onSelect={handlePeriodChange}
              label="AM/PM"
              formatItem={(p) => p}
              width={72}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sun / Moon Session Card with Inline iOS Time Pickers in Navy + Emerald Light Theme.
 * Used exclusively for Daily Time Logs actual attendance.
 */
export function IOSSessionCard({
  title = 'Morning',
  icon = 'sun',
  enabled = true,
  onToggle,
  timeIn = '08:00',
  onTimeInChange,
  timeOut = '12:00',
  onTimeOutChange,
  durationHours = 4,
}) {
  const isSun = icon === 'sun';
  const isMorning = title.toLowerCase().includes('morning');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        width: '100%',
      }}
    >
      {/* Session Toggle Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 1px 4px rgba(20, 43, 73, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Icon in Rounded Square */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 11,
              backgroundColor: enabled ? 'rgba(16, 185, 129, 0.12)' : '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: enabled ? '#10b981' : '#94a3b8',
              transition: 'all 0.2s ease',
            }}
          >
            {isSun ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#142b49' }}>
              {title} Session
            </span>
            <span style={{ fontSize: 13, color: enabled ? '#10b981' : '#64748b', fontWeight: enabled ? 600 : 400 }}>
              {enabled ? `Enabled (${durationHours} hrs)` : 'Disabled (0 hrs)'}
            </span>
          </div>
        </div>

        {/* Emerald iOS Toggle Switch */}
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={`Toggle ${title} Session`}
          onClick={() => {
            playPickerTick();
            onToggle?.(!enabled);
          }}
          style={{
            width: 52,
            height: 32,
            borderRadius: 16,
            backgroundColor: enabled ? '#10b981' : '#cbd5e1',
            position: 'relative',
            border: 'none',
            cursor: 'pointer',
            padding: 3,
            transition: 'background-color 0.2s ease',
            outline: 'none',
          }}
        >
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: '#ffffff',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
              transform: enabled ? 'translateX(20px)' : 'translateX(0)',
              transition: 'transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          />
        </button>
      </div>

      {/* Embedded Session Container with Time In & Time Out */}
      {enabled && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderRadius: 14,
            padding: '16px',
            border: '1.5px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            boxShadow: '0 2px 6px rgba(20, 43, 73, 0.04)',
          }}
        >
          {/* Card Title with Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              {isSun ? (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#142b49' }}>
              {title}
            </span>
          </div>

          {/* Time In iOS Wheel Picker */}
          <IOSInlineTimePicker
            label={`${title.toUpperCase()} TIME IN`}
            value={timeIn}
            onChange={onTimeInChange}
          />

          {/* Time Out iOS Wheel Picker (with autoPmOn12 for Morning Time Out so 12 is automatically PM) */}
          <IOSInlineTimePicker
            label={`${title.toUpperCase()} TIME OUT`}
            value={timeOut}
            onChange={onTimeOutChange}
            autoPmOn12={isMorning}
          />
        </div>
      )}
    </div>
  );
}
