import React, { useState } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { StarIcon, CheckCircleIcon } from '../common/BrandIcons';

function formatReviewDate(iso) {
  if (!iso) return 'Recently';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Repeats base items minimally only when needed so each half of a seamless marquee track
 * cleanly exceeds typical viewport width without excessive repetition.
 */
function buildRowItems(source, minCardsPerGroup = 4) {
  if (!source || source.length === 0) return [];
  const repeats = Math.max(1, Math.ceil(minCardsPerGroup / source.length));
  const items = [];
  for (let r = 0; r < repeats; r++) {
    for (let i = 0; i < source.length; i++) {
      items.push({
        ...source[i],
        _loopKey: `${source[i].id}-r${r}-i${i}`,
      });
    }
  }
  return items;
}

function ReviewCard({ review, index, isClone = false }) {
  const isAlt = index % 2 === 1;
  const rating = Math.max(1, Math.min(5, Number(review.rating || 5)));

  return (
    <div className="ojt-feedback-card-wrap">
      <article
        className={`ojt-feedback-card${isAlt ? ' ojt-feedback-card-alt' : ''}`}
        tabIndex={isClone ? undefined : 0}
        aria-label={
          isClone
            ? undefined
            : `${rating} out of 5 stars review by ${review.display_name || 'Anonymous'}`
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Rating Stars + Verified Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }} aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  filled={star <= rating}
                  style={{
                    width: 16,
                    height: 16,
                    color: star <= rating ? '#f59e0b' : '#e2e8f0',
                  }}
                />
              ))}
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#142b49', marginLeft: 5 }}>
                {rating}.0
              </span>
            </div>

            {review.is_verified_student && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  padding: '3px 9px',
                  borderRadius: 9999,
                  whiteSpace: 'nowrap',
                }}
              >
                <CheckCircleIcon style={{ width: 12, height: 12 }} />
                Verified Student
              </span>
            )}
          </div>

          {/* Written Feedback */}
          <p
            style={{
              margin: 0,
              fontSize: '0.93rem',
              lineHeight: 1.6,
              color: '#334155',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
            }}
          >
            “{review.comment}”
          </p>
        </div>

        {/* Author Display Name & Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            paddingTop: 10,
            borderTop: '1px solid #f1f5f9',
          }}
        >
          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#142b49' }}>
            {review.display_name || 'Anonymous'}
          </span>
          <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
            {formatReviewDate(review.created_at)}
          </span>
        </div>
      </article>
    </div>
  );
}

function CarouselRow({ items, direction = 'rtl', rowLabel }) {
  const trackClass =
    direction === 'ltr'
      ? 'ojt-carousel-track ojt-carousel-track-ltr'
      : 'ojt-carousel-track ojt-carousel-track-rtl';

  return (
    <div className="ojt-carousel-row" role="region" aria-label={rowLabel}>
      <div className={trackClass} data-direction={direction}>
        <div className="ojt-carousel-group">
          {items.map((review, idx) => (
            <ReviewCard key={review._loopKey} review={review} index={idx} />
          ))}
        </div>
        <div className="ojt-carousel-group ojt-carousel-group-clone" aria-hidden="true">
          {items.map((review, idx) => (
            <ReviewCard key={`clone-${review._loopKey}`} review={review} index={idx} isClone />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeedbackCarousel({ reviews = [], isLoading = false, onWriteReviewClick }) {
  const [isPaused, setIsPaused] = useState(false);

  if (isLoading) {
    return (
      <section aria-label="Published Student Reviews" style={{ padding: '12px 0 28px 0' }}>
        <div className="ojt-landing-container">
          <Card elevation="low" padding={6} style={{ backgroundColor: '#ffffff', borderRadius: 16, textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
              Loading approved student reviews...
            </p>
          </Card>
        </div>
      </section>
    );
  }

  // Empty state when no approved reviews exist yet
  if (reviews.length === 0) {
    return (
      <section aria-label="Published Student Reviews" style={{ padding: '12px 0 28px 0' }}>
        <div className="ojt-landing-container">
          <Card
            elevation="low"
            padding={6}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              border: '1px solid #e2e8f0',
              textAlign: 'center',
            }}
          >
            <div style={{ maxWidth: 460, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StarIcon filled style={{ width: 24, height: 24 }} />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#142b49' }}>
                No Published Reviews Yet
              </h2>
              <p style={{ margin: 0, fontSize: '0.92rem', color: '#64748b', lineHeight: 1.6 }}>
                Approved student and visitor reviews will appear here once reviewed by an administrator. Be the first to share your experience below.
              </p>
              {onWriteReviewClick && (
                <div style={{ marginTop: 4 }}>
                  <Button
                    label="Share Your Experience"
                    variant="primary"
                    className="ojt-btn-black"
                    size="sm"
                    onClick={onWriteReviewClick}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </section>
    );
  }

  // Insufficient approved reviews (< 2): show single static review cleanly instead of repeating 1 card endlessly
  if (reviews.length === 1) {
    return (
      <section aria-label="Published Student Reviews" style={{ padding: '12px 0 28px 0' }}>
        <div className="ojt-landing-container">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <div style={{ maxWidth: 400, width: '100%' }}>
              <ReviewCard review={reviews[0]} index={0} />
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b', textAlign: 'center' }}>
              More reviews will appear in the continuous two-row showcase as additional feedback is approved.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // 2+ approved reviews: build two distinct rows moving in opposite directions
  let row1Source;
  let row2Source;
  if (reviews.length >= 4) {
    row1Source = reviews.filter((_, idx) => idx % 2 === 0);
    row2Source = reviews.filter((_, idx) => idx % 2 === 1);
  } else {
    row1Source = reviews;
    row2Source = [...reviews.slice(1), reviews[0]];
  }

  const row1Items = buildRowItems(row1Source, 4);
  const row2Items = buildRowItems(row2Source, 4);

  return (
    <section aria-label="Published Student Reviews Carousel" style={{ padding: '8px 0 28px 0' }}>
      <div className="ojt-landing-container" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#142b49' }}>
              Verified Community Feedback
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Hover or focus any review card to pause movement.
            </p>
          </div>

          <Button
            label={isPaused ? 'Resume Carousel' : 'Pause Carousel'}
            variant="secondary"
            size="sm"
            aria-pressed={isPaused}
            onClick={() => setIsPaused((prev) => !prev)}
          />
        </div>
      </div>

      <div className={`ojt-carousel-stage${isPaused ? ' is-paused' : ''}`}>
        <CarouselRow
          items={row1Items}
          direction="rtl"
          rowLabel="Featured reviews row 1 moving right to left"
        />
        <CarouselRow
          items={row2Items}
          direction="ltr"
          rowLabel="Featured reviews row 2 moving left to right"
        />
      </div>
    </section>
  );
}
