import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrainingContext } from './TrainingContextInstance';
import {
  REQUIRED_OJT_HOURS,
  loadStoredRecords,
  saveStoredRecords,
  calculateCompletedHours,
  calculateRemainingHours,
  calculateCompletionRate,
  getRecentRecords,
  createTrainingRecord,
  updateTrainingRecord,
} from '../services/trainingService';
import { loadOnboardingData } from '../services/onboardingService';
import { getCurrentUser } from '../services/authService';

export function TrainingProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const currentUserId = currentUser?.id || null;

  const [records, setRecords] = useState(() => loadStoredRecords(currentUserId));
  const [requiredHours, setRequiredHoursState] = useState(() => {
    const onboarding = loadOnboardingData(currentUserId);
    return Number(onboarding?.requiredHours) || REQUIRED_OJT_HOURS;
  });

  // Watch for session changes (login, logout, or account switch)
  useEffect(() => {
    const checkUser = () => {
      const activeUser = getCurrentUser();
      if (activeUser?.id !== currentUser?.id) {
        setCurrentUser(activeUser);
        const newId = activeUser?.id || null;
        setRecords(loadStoredRecords(newId));
        const onboarding = loadOnboardingData(newId);
        setRequiredHoursState(Number(onboarding?.requiredHours) || REQUIRED_OJT_HOURS);
      }
    };

    // Check on storage event and on window focus
    window.addEventListener('storage', checkUser);
    window.addEventListener('focus', checkUser);
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('focus', checkUser);
    };
  }, [currentUser?.id]);

  // Persist records to the user-specific storage key whenever records change
  useEffect(() => {
    if (currentUserId) {
      saveStoredRecords(currentUserId, records);
    }
  }, [records, currentUserId]);

  const setRequiredHours = useCallback((hours) => {
    const val = Number(hours) || REQUIRED_OJT_HOURS;
    setRequiredHoursState(val);
    const onboarding = loadOnboardingData(currentUserId);
    try {
      localStorage.setItem(
        `ojt_onboarding_data_${currentUserId || 'guest'}`,
        JSON.stringify({ ...onboarding, requiredHours: val })
      );
    } catch (err) {
      console.error('Failed to update required hours in storage', err);
    }
  }, [currentUserId]);

  const completedHours = useMemo(() => calculateCompletedHours(records), [records]);
  const remainingHours = useMemo(() => calculateRemainingHours(requiredHours, completedHours), [requiredHours, completedHours]);
  const completionRate = useMemo(() => calculateCompletionRate(requiredHours, completedHours), [requiredHours, completedHours]);
  const recentRecords = useMemo(() => getRecentRecords(records, 5), [records]);

  const addRecord = useCallback((recordInput) => {
    const newRecord = createTrainingRecord({
      ...recordInput,
      userId: currentUserId,
    });
    setRecords((prev) => [newRecord, ...prev]);
    return newRecord;
  }, [currentUserId]);

  const updateRecord = useCallback((id, updatedFields) => {
    setRecords((prev) => updateTrainingRecord(prev, id, updatedFields, currentUserId));
  }, [currentUserId]);

  const deleteRecord = useCallback((id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAllRecords = useCallback(() => {
    setRecords([]);
  }, []);

  const value = {
    currentUser,
    records,
    requiredHours,
    setRequiredHours,
    completedHours,
    remainingHours,
    completionRate,
    recentRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    clearAllRecords,
  };

  return <TrainingContext.Provider value={value}>{children}</TrainingContext.Provider>;
}
