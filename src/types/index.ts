export interface GPSPoint {
  timestamp: number;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
}

export interface Split {
  distance: number; // in meters (1000, 2000, 3000, etc.)
  time: number; // duration at this split in seconds
  pace: number; // pace for this split in min/km
}

export interface Run {
  id: string;
  startTime: number;
  endTime: number;
  duration: number;
  distance: number;
  avgPace: number;
  calories: number;
  points: GPSPoint[];
  splits?: Split[];
  elevationGain?: number;
  elevationLoss?: number;
}

export type WorkoutType = 'easy' | 'tempo' | 'intervals' | 'long' | 'rest';
export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type PlanDistance = '5K' | '10K' | 'Half Marathon' | 'Marathon';

export interface Interval {
  type: 'warmup' | 'work' | 'rest' | 'cooldown';
  duration: number; // in seconds
  pace?: string; // e.g., "5:00" min/km
  repeat?: number; // how many times to repeat this interval
}

export interface Workout {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  type: WorkoutType;
  name: string;
  description: string;
  distance?: number; // in meters
  duration?: number; // in seconds
  intervals?: Interval[];
}

export interface WeekData {
  weekNumber: number;
  workouts: Workout[];
}

export interface TrainingPlan {
  id: string;
  name: string;
  description: string;
  level: TrainingLevel;
  distance: PlanDistance;
  durationWeeks: number;
  weeks: WeekData[];
}

export interface UserTrainingPlan {
  id: string;
  planId: string;
  startDate: number;
  currentWeek: number;
  isActive: boolean;
}

export interface CompletedWorkout {
  id: string;
  workoutId: string;
  completedDate: number;
  runId?: string;
}
