import { useState, useEffect, useRef } from 'react';
import { Workout, Interval } from '../types';
import * as Speech from 'expo-speech';

export const useGuidedWorkout = () => {
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isGuidedMode, setIsGuidedMode] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [intervalTimeRemaining, setIntervalTimeRemaining] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const currentRepeatRef = useRef(0);

  const startGuidedWorkout = (selectedWorkout: Workout) => {
    if (!selectedWorkout.intervals || selectedWorkout.intervals.length === 0) {
      return;
    }

    setWorkout(selectedWorkout);
    setIsGuidedMode(true);
    setCurrentIntervalIndex(0);
    setIsPaused(false);
    currentRepeatRef.current = 0;
    
    const firstInterval = selectedWorkout.intervals[0];
    setIntervalTimeRemaining(firstInterval.duration);
    
    // Announce first interval
    Speech.speak(`Starting ${firstInterval.type}`, { language: 'en' });
  };

  const pauseGuidedWorkout = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeGuidedWorkout = () => {
    setIsPaused(false);
  };

  const stopGuidedWorkout = () => {
    setIsGuidedMode(false);
    setWorkout(null);
    setCurrentIntervalIndex(0);
    setIntervalTimeRemaining(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isGuidedMode || isPaused || !workout?.intervals) return;

    timerRef.current = setInterval(() => {
      setIntervalTimeRemaining((prev) => {
        if (prev <= 1) {
          // Move to next interval
          const currentInterval = workout.intervals![currentIntervalIndex];
          const hasRepeat = currentInterval.repeat && currentInterval.repeat > 1;
          
          if (hasRepeat && currentRepeatRef.current < currentInterval.repeat! - 1) {
            // Repeat this interval
            currentRepeatRef.current += 1;
            Speech.speak(`Repeat ${currentRepeatRef.current + 1}`, { language: 'en' });
            return currentInterval.duration;
          } else {
            // Move to next interval
            currentRepeatRef.current = 0;
            const nextIndex = currentIntervalIndex + 1;
            
            if (nextIndex >= workout.intervals!.length) {
              // Workout complete
              Speech.speak('Workout complete! Great job!', { language: 'en' });
              stopGuidedWorkout();
              return 0;
            } else {
              setCurrentIntervalIndex(nextIndex);
              const nextInterval = workout.intervals![nextIndex];
              Speech.speak(`${nextInterval.type} starting`, { language: 'en' });
              return nextInterval.duration;
            }
          }
        }
        
        // 10 second warning
        if (prev === 10) {
          Speech.speak('10 seconds remaining', { language: 'en' });
        }
        
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isGuidedMode, isPaused, currentIntervalIndex, workout]);

  const getCurrentInterval = (): Interval | null => {
    if (!workout?.intervals || currentIntervalIndex >= workout.intervals.length) {
      return null;
    }
    return workout.intervals[currentIntervalIndex];
  };

  const getNextInterval = (): Interval | null => {
    if (!workout?.intervals || currentIntervalIndex + 1 >= workout.intervals.length) {
      return null;
    }
    return workout.intervals[currentIntervalIndex + 1];
  };

  return {
    isGuidedMode,
    currentInterval: getCurrentInterval(),
    nextInterval: getNextInterval(),
    intervalTimeRemaining,
    isPaused,
    startGuidedWorkout,
    pauseGuidedWorkout,
    resumeGuidedWorkout,
    stopGuidedWorkout,
  };
};
