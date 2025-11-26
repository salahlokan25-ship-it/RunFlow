import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
  HealthActivityOptions,
} from 'react-native-health';
import { Platform } from 'react-native';

// Define permissions
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Workout,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    ],
  },
} as HealthKitPermissions;

export interface WorkoutData {
  type: string;
  startDate: Date;
  endDate: Date;
  duration: number; // seconds
  distance: number; // meters
  calories: number;
  heartRate?: number[];
  route?: { latitude: number; longitude: number }[];
}

class HealthKitService {
  private isAvailable: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.isAvailable = Platform.OS === 'ios';
  }

  async requestPermissions(): Promise<boolean> {
    if (!this.isAvailable) {
      return false;
    }

    return new Promise((resolve) => {
      AppleHealthKit.initHealthKit(permissions, (error: string) => {
        if (error) {
          console.log('[HealthKitService] Error initializing HealthKit:', error);
          resolve(false);
          return;
        }
        console.log('[HealthKitService] HealthKit initialized successfully');
        this.isInitialized = true;
        resolve(true);
      });
    });
  }

  async saveWorkout(workout: WorkoutData): Promise<boolean> {
    if (!this.isAvailable || !this.isInitialized) {
      console.log('[HealthKitService] Not available or not initialized');
      return false;
    }

    const options: HealthActivityOptions = {
      type: 'Running', // Default to Running, map other types if needed
      startDate: workout.startDate.toISOString(),
      endDate: workout.endDate.toISOString(),
      energyBurned: workout.calories,
      energyBurnedUnit: 'kcal',
      distance: workout.distance,
      distanceUnit: 'meter',
    };

    return new Promise((resolve) => {
      AppleHealthKit.saveWorkout(options, (error: Object, result: Object) => {
        if (error) {
          console.log('[HealthKitService] Error saving workout:', error);
          resolve(false);
          return;
        }
        console.log('[HealthKitService] Workout saved successfully:', result);
        resolve(true);
      });
    });
  }

  async getStepsToday(): Promise<number> {
    if (!this.isAvailable || !this.isInitialized) {
      return 0;
    }

    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    };

    return new Promise((resolve) => {
      AppleHealthKit.getStepCount(options, (err: Object, results: HealthValue) => {
        if (err) {
          console.log('[HealthKitService] Error getting steps:', err);
          resolve(0);
          return;
        }
        resolve(results.value);
      });
    });
  }
}

export default new HealthKitService();
