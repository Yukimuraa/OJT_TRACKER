import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@astryxdesign/core/Card';
import { Button } from '@astryxdesign/core/Button';
import { TextArea } from '@astryxdesign/core/TextArea';
import { Banner } from '@astryxdesign/core/Banner';
import { Divider } from '@astryxdesign/core/Divider';
import { APP_CONFIG } from '../../config/appConfig';
import { GraduationCapIcon, StarIcon, CheckCircleIcon } from '../../components/common/BrandIcons';
import { FeedbackCarousel } from '../../components/feedback/FeedbackCarousel';
import { getCurrentUser, fetchCurrentUser } from '../../services/authService';
import { fetchPublicFeedback, submitPublicFeedback } from '../../services/feedbackService';

const RATING_LABELS = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent',
};

export function FeedbackPage({ onNavigate }) {
  const [authenticatedUser, setAuthenticatedUser] = useState(() => getCurrentUser());
  const [summary, setSummary] = useState({
    total_approved: 0,
    average_rating: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviews, setReviews] = useState([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [displayPreference, setDisplayPreference] = useState('anonymous');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const formSectionRef = useRef(null);

  const loadPublicReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    setLoadError('');
    try {
      const res = await fetchPublicFeedback();
      if (res?.summary) {
        setSummary(res.summary);
      }
      setReviews(Array.isArray(res?.reviews) ? res.reviews : []);
    } catch (err) {
      setLoadError(err?.message || 'Unable to load published feedback right now.');
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    loadPublicReviews();

    let isMounted = true;
    fetchCurrentUser()
      .then((liveUser) => {
        if (isMounted) setAuthenticatedUser(liveUser);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [loadPublicReviews]);

  const isSignedIn = Boolean(authenticatedUser);
  const isAdmin = authenticatedUser?.role === 'admin';
  const studentFirstName = (authenticatedUser?.name || '').trim().split(/\s+/)[0] || '';

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    if (isAdmin) {
      onNavigate?.('admin-dashboard');
    } else if (isSignedIn) {
      onNavigate?.('dashboard');
    } else {
      onNavigate?.('landing');
    }
  };

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!rating || rating < 1 || rating > 5) {
      nextErrors.rating = 'Please select an overall rating from 1 to 5 stars.';
    }
    const trimmed = comment.trim();
    if (!trimmed) {
      nextErrors.comment = 'Please write your feedback before submitting.';
    } else if (trimmed.length < 5) {
      nextErrors.comment = 'Please provide at least 5 characters in your feedback.';
    } else if (trimmed.length > 1500) {
      nextErrors.comment = 'Feedback cannot exceed 1,500 characters.';
    }
    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitLockRef.current || isSubmitting || isAdmin) return;

    setSubmitError('');
    setSubmitSuccess('');
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await submitPublicFeedback({
        rating,
        comment,
        displayNamePreference: displayPreference,
      });

      if (result.success) {
        setRating(0);
        setHoverRating(0);
        setComment('');
        setDisplayPreference('anonymous');
        setSubmitSuccess(result.message);
        return;
      }

      if (result.errors && Object.keys(result.errors).length > 0) {
        setErrors(result.errors);
      }
      setSubmitError(result.message || 'Unable to submit your feedback. Please try again.');
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const totalApproved = Number(summary.total_approved || 0);
  const averageRating = Number(summary.average_rating || 0);
  const distribution = summary.distribution || {};
  const activeVisualRating = hoverRating || rating;

  return (
    <div className="ojt-feedback-page">
      {/* Top Navigation */}
      <header style={{ padding: 'clamp(16px, 3vw, 24px) 0', borderBottom: '1px solid #f1f5f9', backgroundColor: '#FCFCFB' }}>
        <div className="ojt-landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.('landing');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <GraduationCapIcon style={{ width: 22, height: 22 }} />
            </div>
            <div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#142b49', display: 'block', lineHeight: 1.15 }}>
                {APP_CONFIG.name}
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Feedback &amp; Ratings
              </span>
            </div>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button label="Return to Previous Page" variant="secondary" size="sm" onClick={handleBack} />
            {isSignedIn ? (
              <Button
                label={isAdmin ? 'Admin Portal' : 'Student Dashboard'}
                variant="primary"
                className="ojt-btn-black"
                size="sm"
                onClick={() => onNavigate?.(isAdmin ? 'admin-dashboard' : 'dashboard')}
              />
            ) : (
              <Button
                label="Student Login"
                variant="primary"
                className="ojt-btn-black"
                size="sm"
                onClick={() => onNavigate?.('login')}
              />
            )}
          </div>
        </div>
      </header>

      {/* Section A — Hero & Approved Database Statistics */}
      <section style={{ padding: 'clamp(28px, 5vw, 52px) 0 24px 0' }}>
        <div className="ojt-landing-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
              gap: 'clamp(20px, 4vw, 36px)',
              alignItems: 'center',
            }}
          >
            {/* Left Copy */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <span
                style={{
                  alignSelf: 'flex-start',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#059669',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  padding: '5px 12px',
                  borderRadius: 9999,
                  letterSpacing: '0.03em',
                }}
              >
                Student &amp; Community Reviews
              </span>
              <h1
                style={{
                  fontSize: 'clamp(1.85rem, 4.5vw, 2.75rem)',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.025em',
                  color: '#142b49',
                  margin: 0,
                }}
              >
                What Students Say
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.95rem, 1.8vw, 1.08rem)',
                  lineHeight: 1.65,
                  color: '#475569',
                  maxWidth: 520,
                }}
              >
                Real experiences from students using OJT Hours Tracker. Your feedback helps us make the experience better for everyone.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 4 }}>
                <Button
                  label="Share Your Experience"
                  variant="primary"
                  className="ojt-btn-black"
                  size="md"
                  onClick={scrollToForm}
                />
              </div>
            </div>

            {/* Right Real Approved Statistics Card */}
            <Card
              elevation="low"
              padding={5}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 18,
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 30px -14px rgba(20, 43, 73, 0.12)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Average Approved Rating
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#142b49', lineHeight: 1 }}>
                        {totalApproved > 0 ? averageRating.toFixed(1) : '—'}
                      </span>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#64748b' }}>
                        / 5.0
                      </span>
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, marginTop: 6 }} aria-label={`Average rating ${averageRating} out of 5`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon
                          key={star}
                          filled={totalApproved > 0 && star <= Math.round(averageRating)}
                          style={{
                            width: 16,
                            height: 16,
                            color: totalApproved > 0 && star <= Math.round(averageRating) ? '#f59e0b' : '#cbd5e1',
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 12,
                      padding: '10px 16px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#142b49', lineHeight: 1.1 }}>
                      {totalApproved}
                    </div>
                    <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748b', marginTop: 2 }}>
                      Published Review{totalApproved === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>

                <Divider variant="subtle" />

                {/* Five-star distribution */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = Number(distribution[String(star)] ?? distribution[star] ?? 0);
                    const pct = totalApproved > 0 ? Math.round((count / totalApproved) * 100) : 0;
                    return (
                      <div
                        key={star}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: '0.82rem',
                        }}
                      >
                        <span style={{ width: 46, fontWeight: 700, color: '#142b49' }}>{star} Star{star > 1 ? 's' : ''}</span>
                        <div
                          style={{
                            flex: 1,
                            height: 8,
                            borderRadius: 9999,
                            backgroundColor: '#e2e8f0',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              backgroundColor: '#10b981',
                              borderRadius: 9999,
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <span style={{ width: 64, textAlign: 'right', color: '#475569', fontWeight: 600 }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {loadError && (
        <div className="ojt-landing-container" style={{ marginBottom: 16 }}>
          <Banner status="error" title={loadError} isDismissable onDismiss={() => setLoadError('')} />
        </div>
      )}

      {/* Section B — Two-Row Infinite Floating Review Carousel */}
      <FeedbackCarousel
        reviews={reviews}
        isLoading={isLoadingReviews}
        onWriteReviewClick={scrollToForm}
      />

      {/* Section C — Share Your Experience Form */}
      <section ref={formSectionRef} id="share-experience" style={{ padding: '20px 0 clamp(40px, 6vw, 68px) 0' }}>
        <div className="ojt-landing-container">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <Card
              elevation="low"
              padding={6}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 18,
                border: '1px solid #e2e8f0',
                boxShadow: '0 12px 30px -16px rgba(20, 43, 73, 0.12)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <h2 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 800, color: '#142b49', margin: '0 0 6px 0' }}>
                    Share Your Experience
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.94rem', color: '#64748b', lineHeight: 1.55 }}>
                    Have you used OJT Hours Tracker? Let us know what you think.
                  </p>
                </div>

                <Divider variant="subtle" />

                {isAdmin && (
                  <Banner
                    status="info"
                    title="Administrator accounts moderate feedback from the Admin Portal and cannot submit public student reviews."
                  />
                )}

                {submitSuccess && (
                  <Banner
                    status="success"
                    title={submitSuccess}
                    isDismissable
                    onDismiss={() => setSubmitSuccess('')}
                  />
                )}

                {submitError && (
                  <Banner
                    status="error"
                    title={submitError}
                    isDismissable
                    onDismiss={() => setSubmitError('')}
                  />
                )}

                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* 1. Overall Rating — Interactive 1-5 Star Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#142b49' }}>
                      Overall Rating <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div
                      role="radiogroup"
                      aria-label="Overall Rating"
                      style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((starValue) => {
                        const isSelected = rating === starValue;
                        const isLit = starValue <= activeVisualRating;
                        return (
                          <button
                            key={starValue}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            aria-label={`Rate ${starValue} out of 5 stars (${RATING_LABELS[starValue]})`}
                            disabled={isAdmin || isSubmitting}
                            onMouseEnter={() => setHoverRating(starValue)}
                            onClick={() => {
                              setRating(starValue);
                              if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
                            }}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              border: isLit ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                              backgroundColor: isLit ? 'rgba(245, 158, 11, 0.1)' : '#f8fafc',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: isAdmin || isSubmitting ? 'not-allowed' : 'pointer',
                              transition: 'transform 0.12s ease, background-color 0.15s ease, border-color 0.15s ease',
                              transform: hoverRating === starValue ? 'scale(1.06)' : 'scale(1)',
                              color: isLit ? '#f59e0b' : '#94a3b8',
                            }}
                          >
                            <StarIcon filled={isLit} style={{ width: 22, height: 22 }} />
                          </button>
                        );
                      })}
                      <span style={{ fontSize: '0.86rem', fontWeight: 600, color: activeVisualRating ? '#142b49' : '#64748b', marginLeft: 4 }}>
                        {activeVisualRating
                          ? `${activeVisualRating}/5 — ${RATING_LABELS[activeVisualRating]}`
                          : 'Select 1 to 5 stars'}
                      </span>
                    </div>
                    {errors.rating && (
                      <span role="alert" style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 600 }}>
                        {errors.rating}
                      </span>
                    )}
                  </div>

                  {/* 2. Written Feedback */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <TextArea
                      label="Your Feedback *"
                      placeholder="Tell us what you like about OJT Hours Tracker or what we can improve..."
                      value={comment}
                      onChange={(val) => {
                        setComment(val);
                        if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }));
                      }}
                      rows={4}
                      maxLength={1500}
                      isDisabled={isAdmin || isSubmitting}
                      error={errors.comment}
                      width="100%"
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' }}>
                      <span>Minimum 5 characters. Reviews appear publicly once approved.</span>
                      <span>{comment.length} / 1500</span>
                    </div>
                  </div>

                  {/* 3. Display Name Preference */}
                  <fieldset
                    disabled={isAdmin || isSubmitting}
                    style={{
                      border: 'none',
                      padding: 0,
                      margin: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <legend style={{ fontSize: '0.875rem', fontWeight: 700, color: '#142b49', marginBottom: 4 }}>
                      Display Name Preference
                    </legend>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 10,
                      }}
                    >
                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: 12,
                          borderRadius: 12,
                          border: displayPreference === 'anonymous' ? '1.5px solid #142b49' : '1px solid #e2e8f0',
                          backgroundColor: displayPreference === 'anonymous' ? '#f8fafc' : '#ffffff',
                          cursor: isAdmin || isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="display_name_preference"
                          value="anonymous"
                          checked={displayPreference === 'anonymous'}
                          onChange={() => setDisplayPreference('anonymous')}
                          style={{ marginTop: 3 }}
                        />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#142b49' }}>
                            Submit anonymously
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                            Shown publicly as “Anonymous”.
                          </div>
                        </div>
                      </label>

                      <label
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: 12,
                          borderRadius: 12,
                          border: displayPreference === 'first_name' ? '1.5px solid #142b49' : '1px solid #e2e8f0',
                          backgroundColor: displayPreference === 'first_name' ? '#f8fafc' : '#ffffff',
                          cursor: isAdmin || isSubmitting ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name="display_name_preference"
                          value="first_name"
                          checked={displayPreference === 'first_name'}
                          onChange={() => setDisplayPreference('first_name')}
                          style={{ marginTop: 3 }}
                        />
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#142b49' }}>
                            Display my first name
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                            {isSignedIn && studentFirstName
                              ? `Shown as “${studentFirstName}” (email & ID stay private).`
                              : 'Uses first name when signed in; guest reviews appear as Anonymous.'}
                          </div>
                        </div>
                      </label>
                    </div>
                  </fieldset>

                  {/* Account context note without collecting private info */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.8rem',
                      color: '#475569',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '10px 12px',
                    }}
                  >
                    <CheckCircleIcon style={{ width: 15, height: 15, color: '#10b981', flexShrink: 0 }} />
                    <span>
                      {isSignedIn
                        ? 'Submitting via your signed-in student account. Your email and student ID are never displayed publicly.'
                        : 'No account or email address required to submit feedback.'}
                    </span>
                  </div>

                  {/* 4. Submit Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type="submit"
                      label={isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
                      variant="primary"
                      className="ojt-btn-black"
                      size="md"
                      isLoading={isSubmitting}
                      isDisabled={isSubmitting || isAdmin}
                    />
                  </div>
                </form>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FeedbackPage;
