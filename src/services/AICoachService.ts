import * as Speech from 'expo-speech';
import { RunMetrics } from './SensorService';

export interface CoachingAdvice {
  type: 'pace' | 'heartrate' | 'form' | 'terrain' | 'energy' | 'motivation';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  action: string;
  shouldSpeak: boolean;
}

export interface CoachingContext {
  targetPace?: number;      // Target pace (min/km)
  targetHRZone?: {          // Target heart rate zone
    min: number;
    max: number;
  };
  workoutType: 'easy' | 'tempo' | 'intervals' | 'long' | 'race';
  userFitnessLevel: 'beginner' | 'intermediate' | 'advanced';
}

class AICoachServiceClass {
  private lastAdviceTime: number = 0;
  private adviceQueue: CoachingAdvice[] = [];
  private isSpeaking: boolean = false;
  private adviceCooldown: number = 30000; // 30 seconds between advice

  analyzeMetrics(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    const now = Date.now();
    
    // Don't give advice too frequently
    if (now - this.lastAdviceTime < this.adviceCooldown) {
      return null;
    }

    // Check pace
    const paceAdvice = this.checkPace(metrics, context);
    if (paceAdvice) return paceAdvice;

    // Check heart rate
    const hrAdvice = this.checkHeartRate(metrics, context);
    if (hrAdvice) return hrAdvice;

    // Check form (cadence)
    const formAdvice = this.checkForm(metrics, context);
    if (formAdvice) return formAdvice;

    // Check terrain
    const terrainAdvice = this.checkTerrain(metrics, context);
    if (terrainAdvice) return terrainAdvice;

    // Motivational messages
    const motivationAdvice = this.getMotivation(metrics, context);
    if (motivationAdvice) return motivationAdvice;

    return null;
  }

  private checkPace(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    if (!context.targetPace || metrics.pace === 0) return null;

    const paceDiff = metrics.pace - context.targetPace;
    const paceVariance = Math.abs(paceDiff) / context.targetPace;

    // Too fast
    if (paceDiff < -0.2 && paceVariance > 0.1) {
      const slowdownPercent = Math.round(paceVariance * 100);
      return {
        type: 'pace',
        message: `Slow down ${slowdownPercent}% to maintain your target pace`,
        urgency: 'medium',
        action: 'reduce_pace',
        shouldSpeak: true,
      };
    }

    // Too slow
    if (paceDiff > 0.3 && paceVariance > 0.15) {
      const speedupPercent = Math.round(paceVariance * 100);
      return {
        type: 'pace',
        message: `Pick up the pace by ${speedupPercent}% to hit your target`,
        urgency: 'low',
        action: 'increase_pace',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private checkHeartRate(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    if (!context.targetHRZone || metrics.heartRate === 0) return null;

    const { min, max } = context.targetHRZone;

    // HR too high
    if (metrics.heartRate > max + 10) {
      return {
        type: 'heartrate',
        message: `Slow down to keep your heart rate in zone. Currently at ${metrics.heartRate} BPM`,
        urgency: 'high',
        action: 'reduce_intensity',
        shouldSpeak: true,
      };
    }

    // HR too low (for tempo/intervals)
    if (context.workoutType === 'tempo' && metrics.heartRate < min - 5) {
      return {
        type: 'heartrate',
        message: `Increase your effort. Heart rate is below target zone`,
        urgency: 'medium',
        action: 'increase_intensity',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private checkForm(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    if (metrics.cadence === 0) return null;

    // Low cadence (overstriding risk)
    if (metrics.cadence < 160) {
      const increase = 170 - metrics.cadence;
      return {
        type: 'form',
        message: `Your cadence is low at ${metrics.cadence} steps per minute. Try to increase by ${increase} steps to reduce injury risk`,
        urgency: 'medium',
        action: 'increase_cadence',
        shouldSpeak: true,
      };
    }

    // Check stride length (if too long, might be overstriding)
    if (metrics.stride > 1.4) {
      return {
        type: 'form',
        message: `You may be overstriding. Shorten your step length slightly`,
        urgency: 'low',
        action: 'shorten_stride',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private checkTerrain(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    // Check if there's significant elevation ahead
    if (metrics.elevationAhead > metrics.elevation + 20) {
      const elevationGain = Math.round(metrics.elevationAhead - metrics.elevation);
      return {
        type: 'terrain',
        message: `Hill ahead with ${elevationGain} meters elevation gain. Save energy now`,
        urgency: 'medium',
        action: 'prepare_for_hill',
        shouldSpeak: true,
      };
    }

    // Downhill ahead
    if (metrics.elevationAhead < metrics.elevation - 20) {
      return {
        type: 'terrain',
        message: `Downhill coming up. Let gravity help but maintain control`,
        urgency: 'low',
        action: 'prepare_for_downhill',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private getMotivation(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    // Motivational messages based on distance milestones
    const distanceKm = metrics.distance / 1000;

    if (distanceKm > 0 && distanceKm % 5 < 0.1) { // Every 5km
      const messages = [
        `Great job! You've completed ${Math.floor(distanceKm)} kilometers`,
        `${Math.floor(distanceKm)} kilometers down! Keep up the strong pace`,
        `Excellent work! ${Math.floor(distanceKm)} kilometers completed`,
      ];
      
      return {
        type: 'motivation',
        message: messages[Math.floor(Math.random() * messages.length)],
        urgency: 'low',
        action: 'celebrate',
        shouldSpeak: true,
      };
    }

    return null;
  }

  async speakAdvice(advice: CoachingAdvice) {
    if (!advice.shouldSpeak || this.isSpeaking) return;

    this.isSpeaking = true;
    this.lastAdviceTime = Date.now();

    try {
      await Speech.speak(advice.message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      this.isSpeaking = false;
    }
  }

  setAdviceCooldown(seconds: number) {
    this.adviceCooldown = seconds * 1000;
  }

  reset() {
    this.lastAdviceTime = 0;
    this.adviceQueue = [];
    this.isSpeaking = false;
  }
}

export const AICoachService = new AICoachServiceClass();
