import { Platform } from 'react-native';
import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health';

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
      console.log('HealthKit is only available on iOS');
      return false;
    }

    try {
      const permissions: HealthKitPermissions = {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
            AppleHealthKit.Constants.Permissions.HeartRate,
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          ],
          write: [
            AppleHealthKit.Constants.Permissions.Steps,
            AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          ],
        },
      };

      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(permissions, (error: string) => {
          if (error) {
            console.log('Error initializing HealthKit:', error);
            resolve(false);
          } else {
            console.log('HealthKit initialized successfully');
            this.isInitialized = true;
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Error requesting HealthKit permissions:', error);
      return false;
    }
  }

  async saveWorkout(workout: WorkoutData): Promise<boolean> {
    if (!this.isAvailable || !this.isInitialized) {
      console.log('HealthKit not available or not initialized');
      return false;
    }

    try {
      // Save workout to HealthKit
      const workoutOptions = {
        type: 'Running', // HealthKit workout type
        startDate: workout.startDate.toISOString(),
        endDate: workout.endDate.toISOString(),
        energyBurned: workout.calories, // kcal
        distance: workout.distance, // meters
      };

      return new Promise((resolve) => {
        AppleHealthKit.saveWorkout(workoutOptions, (error: string, result: string) => {
          if (error) {
            console.error('Error saving workout to HealthKit:', error);
            resolve(false);
          } else {
            console.log('Workout saved to HealthKit successfully:', result);
            resolve(true);
          }
        });
      });
    } catch (error) {
      console.error('Error saving workout to HealthKit:', error);
      return false;
    }
  }

  async getStepsToday(): Promise<number> {
    if (!this.isAvailable || !this.isInitialized) {
      return 0;
    }

    try {
      const options = {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date().toISOString(),
      };

      return new Promise((resolve) => {
        AppleHealthKit.getStepCount(options, (error: string, results: HealthValue) => {
          if (error) {
            console.error('Error getting steps from HealthKit:', error);
            resolve(0);
          } else {
            resolve(results.value || 0);
          }
        });
      });
    } catch (error) {
      console.error('Error getting steps from HealthKit:', error);
      return 0;
    }
  }

  async getHeartRateData(startDate: Date, endDate: Date): Promise<number[]> {
    if (!this.isAvailable || !this.isInitialized) {
      return [];
    }

    try {
      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      };

      return new Promise((resolve) => {
        AppleHealthKit.getHeartRateSamples(options, (error: string, results: HealthValue[]) => {
          if (error) {
            console.error('Error getting heart rate from HealthKit:', error);
            resolve([]);
          } else {
            const heartRates = results.map(r => r.value);
            resolve(heartRates);
          }
        });
      });
    } catch (error) {
      console.error('Error getting heart rate from HealthKit:', error);
      return [];
    }
  }

  isHealthKitAvailable(): boolean {
    return this.isAvailable;
  }
}

export default new HealthKitService();
