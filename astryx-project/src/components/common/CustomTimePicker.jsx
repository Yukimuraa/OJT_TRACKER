import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogHeader } from '@astryxdesign/core/Dialog';
import { VStack } from '@astryxdesign/core/VStack';
import { HStack } from '@astryxdesign/core/HStack';
import { Heading } from '@astryxdesign/core/Heading';
import { Text } from '@astryxdesign/core/Text';
import { Button } from '@astryxdesign/core/Button';
import { Icon } from '@astryxdesign/core/Icon';
import { Card } from '@astryxdesign/core/Card';

const ITEM_HEIGHT = 40;
const WHEEL_HEIGHT = 216;
const PADDING_Y = (WHEEL_HEIGHT - ITEM_HEIGHT) / 2; // 88px exact center offset

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
 * Formats 24h string into 12-hour display string.
 */
function formatDisplayTime(timeStr) {
  if (!timeStr) return 'Select time';
  const { hour, minute, period } = parse24HourTime(timeStr);
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

/**
 * Individual iOS-Style Wheel Column
 * - Smooth vertical scrolling with scroll-snap
 * - Centers and highlights the selected row
 * - Fades opacity of items above and below the center lens
 * - Supports touch drag, mouse wheel, item clicks, and keyboard navigation
 */
function IOSWheelColumn({
  items,
  selectedValue,
  onSelect,
  formatItem = (v) => String(v),
  label,
}) {
  const containerRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef(null);

  const selectedIndex = items.indexOf(selectedValue);
  const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Scroll to selected item on mount or external change
  const scrollToCurrent = useCallback((behavior = 'smooth') => {
    if (!containerRef.current) return;
    const targetTop = currentIndex * ITEM_HEIGHT;
    if (Math.abs(containerRef.current.scrollTop - targetTop) > 2) {
      isProgrammaticScrollRef.current = true;
      containerRef.current.scrollTo({
        top: targetTop,
        behavior,
      });
      // Reset programmatic flag after smooth scroll settles
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 300);
    }
  }, [currentIndex]);

  useEffect(() => {
    scrollToCurrent('auto');
  }, [scrollToCurrent]);

  // Handle native scroll event and snap settling
  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Debounce to calculate centered item once scroll motion settles
    scrollTimeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(items.length - 1, index));
      if (items[clampedIndex] !== selectedValue) {
        onSelect(items[clampedIndex]);
      }
    }, 60);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = Math.max(0, currentIndex - 1);
      onSelect(items[prevIndex]);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: prevIndex * ITEM_HEIGHT, behavior: 'smooth' });
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = Math.min(items.length - 1, currentIndex + 1);
      onSelect(items[nextIndex]);
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: nextIndex * ITEM_HEIGHT, behavior: 'smooth' });
      }
    }
  };

  // Clicking an item snaps it to the center
  const handleItemClick = (index, val) => {
    onSelect(val);
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div
      style={{
        flex: 1,
        height: WHEEL_HEIGHT,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
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
        }}
      >
        {items.map((item, idx) => {
          const distance = Math.abs(idx - currentIndex);
          const isSelected = distance === 0;

          // iOS-style dynamic optical fade and scale based on distance from center
          let opacity = 1;
          let scale = 1.08;
          let fontWeight = 700;
          let color = '#142b49';

          if (distance === 1) {
            opacity = 0.52;
            scale = 0.94;
            fontWeight = 500;
            color = '#475569';
          } else if (distance === 2) {
            opacity = 0.25;
            scale = 0.86;
            fontWeight = 400;
            color = '#94a3b8';
          } else if (distance >= 3) {
            opacity = 0.1;
            scale = 0.78;
            fontWeight = 400;
            color = '#cbd5e1';
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
                fontSize: 18,
                fontWeight,
                color,
                opacity,
                transform: `scale(${scale})`,
                transition: 'opacity 0.14s ease, transform 0.14s ease, color 0.14s ease',
                cursor: 'pointer',
                fontVariantNumeric: 'tabular-nums',
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
 * iOS-Style Apple Wheel Time Picker Component
 *
 * Features:
 * - Visually inspired by Apple's iOS wheel time picker
 * - Three vertical scrolling drum wheels: Hour (1-12), Minute (00-59, 1-min increments), AM/PM
 * - Smooth vertical scrolling with automatic center snapping
 * - Center highlight lens row with Emerald accent borders (#10B981)
 * - Cylindrical 3D gradient fading values above and below the center lens
 * - Accessible via Touch swipe, Mouse wheel scrolling, Item clicks, and Arrow Keys
 * - Cancel and Confirm actions with clear display
 * - Responsive on mobile and desktop
 */
export function CustomTimePicker({
  label,
  value = '08:00',
  onChange,
  isRequired = false,
  status,
  isDisabled = false,
  description,
  width = '100%',
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Draft state while picker modal is open
  const [draftHour, setDraftHour] = useState(8);
  const [draftMinute, setDraftMinute] = useState(0);
  const [draftPeriod, setDraftPeriod] = useState('AM');

  // Sync draft state with external value when modal opens
  const handleOpen = () => {
    if (isDisabled) return;
    const parsed = parse24HourTime(value);
    setDraftHour(parsed.hour);
    setDraftMinute(parsed.minute);
    setDraftPeriod(parsed.period);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    const formatted24h = to24HourString(draftHour, draftMinute, draftPeriod);
    onChange?.(formatted24h);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const preview24 = to24HourString(draftHour, draftMinute, draftPeriod);
  const hasError = Boolean(status?.message);

  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Field Label */}
      {label && (
        <HStack justify="between" align="baseline">
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary, #142b49)' }}>
            {label}
            {isRequired && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
          </label>
          {description && (
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary, #64748b)' }}>
              {description}
            </span>
          )}
        </HStack>
      )}

      {/* Custom Trigger Card */}
      <button
        type="button"
        disabled={isDisabled}
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '10px 14px',
          borderRadius: 8,
          border: hasError
            ? '1.5px solid #ef4444'
            : '1px solid var(--color-border, #e2e8f0)',
          backgroundColor: isDisabled
            ? 'var(--color-background-muted, #f8fafc)'
            : 'var(--color-background-surface, #ffffff)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          textAlign: 'left',
          transition: 'all 0.18s ease-in-out',
          boxShadow: hasError ? '0 0 0 2px rgba(239, 68, 68, 0.15)' : 'none',
          outline: 'none',
          opacity: isDisabled ? 0.6 : 1,
        }}
      >
        <HStack gap={2.5} align="center">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: 6,
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
            }}
          >
            <Icon icon="clock" size="sm" />
          </div>
          <VStack gap={0}>
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: value ? 'var(--color-text-primary, #142b49)' : 'var(--color-text-secondary, #64748b)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatDisplayTime(value)}
            </span>
            <span style={{ fontSize: 11, color: 'var(--color-text-secondary, #64748b)' }}>
              24h: {value || '—'}
            </span>
          </VStack>
        </HStack>

        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#10b981',
            padding: '3px 8px',
            borderRadius: 6,
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
          }}
        >
          Change
        </span>
      </button>

      {/* Validation Message */}
      {hasError && (
        <span style={{ fontSize: 12, color: '#ef4444', marginTop: 2 }}>
          {status.message}
        </span>
      )}

      {/* iOS Wheel Time Picker Modal Dialog */}
      <Dialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        purpose="form"
        width={380}
        maxHeight="92dvh"
      >
        <DialogHeader
          title={label ? `Select ${label}` : 'Select Time'}
          subtitle="Scroll wheels to set Hour, Minute, and AM/PM"
          onOpenChange={setIsOpen}
        />

        <VStack gap={4} padding={4}>
          {/* Live Digital Display Badge */}
          <Card variant="muted" padding={3}>
            <VStack align="center" gap={1}>
              <Text size="xs" color="secondary" weight="semibold">
                SELECTED TIME
              </Text>
              <HStack gap={2} align="center" justify="center">
                <Heading level={1} style={{ color: '#10b981', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums' }}>
                  {draftHour}:{String(draftMinute).padStart(2, '0')}
                </Heading>
                <div
                  style={{
                    backgroundColor: '#142b49',
                    color: '#ffffff',
                    padding: '3px 9px',
                    borderRadius: 6,
                    fontSize: 15,
                    fontWeight: 700,
                  }}
                >
                  {draftPeriod}
                </div>
              </HStack>
              <Text size="xs" color="secondary">
                24-Hour format: <strong>{preview24}</strong>
              </Text>
            </VStack>
          </Card>

          {/* iOS 3-Wheel Drum Container */}
          <div
            style={{
              position: 'relative',
              height: WHEEL_HEIGHT,
              backgroundColor: '#ffffff',
              borderRadius: 12,
              border: '1px solid var(--color-border, #e2e8f0)',
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(20, 43, 73, 0.04)',
            }}
          >
            {/* Center Lens Bar (Highlights the Selected Row) */}
            <div
              style={{
                position: 'absolute',
                top: PADDING_Y,
                left: 8,
                right: 8,
                height: ITEM_HEIGHT,
                borderRadius: 8,
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderTop: '1.5px solid rgba(16, 185, 129, 0.35)',
                borderBottom: '1.5px solid rgba(16, 185, 129, 0.35)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Cylindrical 3D Fade Gradient Overlay (top & bottom fade) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 2,
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.45) 20%, rgba(255,255,255,0) 36%, rgba(255,255,255,0) 64%, rgba(255,255,255,0.45) 80%, rgba(255,255,255,0.92) 100%)',
              }}
            />

            {/* Three iOS Drum Columns */}
            <div
              style={{
                display: 'flex',
                height: '100%',
                position: 'relative',
                zIndex: 3,
              }}
            >
              {/* Wheel 1: Hour */}
              <IOSWheelColumn
                items={HOURS}
                selectedValue={draftHour}
                onSelect={setDraftHour}
                label="Hour"
                formatItem={(h) => String(h)}
              />

              {/* Column Separator */}
              <div
                style={{
                  width: 1,
                  backgroundColor: 'rgba(226, 232, 240, 0.7)',
                  margin: '12px 0',
                  zIndex: 3,
                }}
              />

              {/* Wheel 2: Minute (1-minute step increments) */}
              <IOSWheelColumn
                items={MINUTES}
                selectedValue={draftMinute}
                onSelect={setDraftMinute}
                label="Minute"
                formatItem={(m) => String(m).padStart(2, '0')}
              />

              {/* Column Separator */}
              <div
                style={{
                  width: 1,
                  backgroundColor: 'rgba(226, 232, 240, 0.7)',
                  margin: '12px 0',
                  zIndex: 3,
                }}
              />

              {/* Wheel 3: AM / PM */}
              <IOSWheelColumn
                items={PERIODS}
                selectedValue={draftPeriod}
                onSelect={setDraftPeriod}
                label="AM/PM"
                formatItem={(p) => p}
              />
            </div>
          </div>

          <Text size="xs" color="secondary" align="center">
            Tip: Scroll wheels with mouse or touch, or use Up/Down arrow keys.
          </Text>
        </VStack>

        {/* Modal Action Buttons */}
        <HStack
          justify="end"
          padding={4}
          gap={2}
          style={{
            borderTop: '1px solid var(--color-border, #e2e8f0)',
            backgroundColor: 'var(--color-background-surface, #ffffff)',
          }}
        >
          <Button
            label="Cancel"
            variant="secondary"
            onClick={handleCancel}
          />
          <Button
            label="Confirm Time"
            variant="primary"
            onClick={handleConfirm}
          />
        </HStack>
      </Dialog>
    </div>
  );
}
