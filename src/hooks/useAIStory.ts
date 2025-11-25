import { useState, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { getStorySegment } from '../services/AIStoryService';

export const useAIStory = (
  isTracking: boolean,
  distance: number,
  duration: number,
  pace: number
) => {
  const [enabled, setEnabled] = useState(false);
  const lastTriggeredIndex = useRef(-1);

  useEffect(() => {
    if (!isTracking || !enabled) return;

    const segment = getStorySegment(distance, duration, pace, lastTriggeredIndex.current);
    if (segment) {
      Speech.speak(segment.text, {
        language: 'en',
        pitch: 1.0,
        rate: 1.0,
      });
      lastTriggeredIndex.current = segment.index;
    }
  }, [isTracking, enabled, distance, duration, pace]);

  const toggleAI = () => {
    if (enabled) {
      Speech.stop();
    }
    setEnabled(!enabled);
  };

  return {
    aiEnabled: enabled,
    toggleAI,
  };
};
