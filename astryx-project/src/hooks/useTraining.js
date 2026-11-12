import { useContext } from 'react';
import { TrainingContext } from '../context/TrainingContextInstance';

export function useTraining() {
  const context = useContext(TrainingContext);
  if (!context) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}
