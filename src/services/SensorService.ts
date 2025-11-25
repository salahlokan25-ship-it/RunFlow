import { Accelerometer } from 'expo-sensors';

export interface RunMetrics {
  pace: number;           // Current pace (min/km)
  heartRate: number;      // BPM (0 if no monitor)
  cadence: number;        // Steps per minute
  stride: number;         // Stride length (meters)
  elevation: number;      // Current elevation
  elevationAhead: number; // Elevation in next 500m
  distance: number;       // Total distance so far
  duration: number;       // Total time so far
}

export interface CadenceData {
  stepsPerMinute: number;
  strideLength: number;
  confidence: number;     // 0-1
}

class SensorServiceClass {
  private accelerometerSubscription: any = null;
  private stepCount: number = 0;
  private lastStepTime: number = 0;
  private stepTimes: number[] = [];

  startCadenceTracking() {
    Accelerometer.setUpdateInterval(100); // 10 Hz

    this.accelerometerSubscription = Accelerometer.addListener((data) => {
      this.detectStep(data);
    });
  }

  stopCadenceTracking() {
    if (this.accelerometerSubscription) {
      this.accelerometerSubscription.remove();
      this.accelerometerSubscription = null;
    }
    this.stepCount = 0;
    this.stepTimes = [];
  }

  private detectStep(data: { x: number; y: number; z: number }) {
    // Calculate magnitude of acceleration
    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    
    // Detect step if magnitude exceeds threshold
    // This is a simplified step detection algorithm
    const threshold = 1.2; // Adjust based on testing
    const now = Date.now();
    
    if (magnitude > threshold && now - this.lastStepTime > 200) {
      this.stepCount++;
      this.stepTimes.push(now);
      this.lastStepTime = now;
      
      // Keep only last 60 seconds of steps
      this.stepTimes = this.stepTimes.filter(t => now - t < 60000);
    }
  }

  getCadence(): CadenceData {
    const now = Date.now();
    const recentSteps = this.stepTimes.filter(t => now - t < 60000);
    
    if (recentSteps.length < 10) {
      return { stepsPerMinute: 0, strideLength: 0, confidence: 0 };
    }

    // Calculate steps per minute
    const timeSpan = (now - recentSteps[0]) / 1000 / 60; // Minutes
    const stepsPerMinute = Math.round(recentSteps.length / timeSpan);

    return {
      stepsPerMinute,
      strideLength: 0, // Will be calculated from pace and cadence
      confidence: Math.min(recentSteps.length / 60, 1),
    };
  }

  calculateStrideLength(pace: number, cadence: number): number {
    if (cadence === 0) return 0;
    
    // pace is in min/km, convert to m/s
    const speedMps = 1000 / (pace * 60);
    
    // stride length = speed / (cadence / 60)
    const strideLength = speedMps / (cadence / 60);
    
    return strideLength;
  }
}

export const SensorService = new SensorServiceClass();
