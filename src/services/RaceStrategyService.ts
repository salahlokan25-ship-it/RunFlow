import { Run } from '../types';

export interface RaceInput {
  distance: number;        // Meters (5000, 10000, 21097, 42195)
  targetTime: number;      // Seconds
  temperature: number;     // Celsius
  humidity: number;        // 0-100
  elevationProfile: number[]; // Elevation per km
  userVO2Max?: number;
  recentRuns: Run[];
}

export interface RaceStrategy {
  pacePerKm: number[];     // Pace for each km
  hydrationPoints: { km: number; amount: string }[];
  energyGels: { km: number; type: string }[];
  heatAdjustments: { km: number; adjustment: string }[];
  elevationPacing: { km: number; strategy: string }[];
  safeZones: { km: number; action: string }[];
  splits: { km: number; targetTime: string }[];
}

class RaceStrategyServiceClass {
  generateRaceStrategy(input: RaceInput): RaceStrategy {
    const distanceKm = input.distance / 1000;
    const targetPacePerKm = (input.targetTime / distanceKm) / 60; // min/km

    // Generate pace strategy (negative split)
    const pacePerKm = this.calculateNegativeSplit(targetPacePerKm, distanceKm, input);

    // Hydration strategy
    const hydrationPoints = this.calculateHydration(distanceKm, input.temperature);

    // Energy gel strategy
    const energyGels = this.calculateEnergyGels(distanceKm);

    // Heat adjustments
    const heatAdjustments = this.calculateHeatAdjustments(distanceKm, input.temperature, input.humidity);

    // Elevation pacing
    const elevationPacing = this.calculateElevationPacing(input.elevationProfile);

    // Safe zones (energy conservation)
    const safeZones = this.calculateSafeZones(distanceKm);

    // Calculate splits
    const splits = this.calculateSplits(pacePerKm);

    return {
      pacePerKm,
      hydrationPoints,
      energyGels,
      heatAdjustments,
      elevationPacing,
      safeZones,
      splits,
    };
  }

  private calculateNegativeSplit(targetPace: number, distance: number, input: RaceInput): number[] {
    const paces: number[] = [];
    
    // Start conservative (5-10 sec slower)
    const startPace = targetPace + 0.15;
    const endPace = targetPace - 0.15;
    
    for (let km = 0; km < distance; km++) {
      // Gradual progression from slow to fast
      const progress = km / distance;
      const pace = startPace - (progress * (startPace - endPace));
      paces.push(Number(pace.toFixed(2)));
    }

    return paces;
  }

  private calculateHydration(distance: number, temperature: number): { km: number; amount: string }[] {
    const points: { km: number; amount: string }[] = [];
    
    // More frequent hydration in heat
    const interval = temperature > 25 ? 3 : 5;
    
    for (let km = interval; km < distance; km += interval) {
      const amount = temperature > 25 ? '200ml' : '150ml';
      points.push({ km, amount });
    }

    return points;
  }

  private calculateEnergyGels(distance: number): { km: number; type: string }[] {
    const gels: { km: number; type: string }[] = [];
    
    if (distance >= 15) {
      // Half marathon and longer
      gels.push({ km: 10, type: 'Energy gel (25g carbs)' });
      gels.push({ km: 20, type: 'Energy gel (25g carbs)' });
    }

    if (distance >= 30) {
      // Marathon
      gels.push({ km: 30, type: 'Energy gel (25g carbs)' });
      gels.push({ km: 35, type: 'Energy gel + caffeine' });
    }

    return gels;
  }

  private calculateHeatAdjustments(distance: number, temp: number, humidity: number): { km: number; adjustment: string }[] {
    const adjustments: { km: number; adjustment: string }[] = [];
    
    if (temp > 25 || humidity > 70) {
      adjustments.push({
        km: 0,
        adjustment: `Start 10-15 sec/km slower due to heat (${temp}°C, ${humidity}% humidity)`,
      });
      
      if (temp > 30) {
        adjustments.push({
          km: Math.floor(distance / 2),
          adjustment: 'Reduce pace by additional 5 sec/km if feeling overheated',
        });
      }
    }

    return adjustments;
  }

  private calculateElevationPacing(elevationProfile: number[]): { km: number; strategy: string }[] {
    const strategies: { km: number; strategy: string }[] = [];
    
    elevationProfile.forEach((elevation, km) => {
      const nextElevation = elevationProfile[km + 1];
      if (!nextElevation) return;

      const elevationChange = nextElevation - elevation;
      
      if (elevationChange > 15) {
        strategies.push({
          km,
          strategy: `Uphill (+${elevationChange}m): Maintain effort, not pace. Expect 15-20 sec/km slower`,
        });
      } else if (elevationChange < -15) {
        strategies.push({
          km,
          strategy: `Downhill (${elevationChange}m): Use gravity but control impact. Can gain 10-15 sec/km`,
        });
      }
    });

    return strategies;
  }

  private calculateSafeZones(distance: number): { km: number; action: string }[] {
    const zones: { km: number; action: string }[] = [];
    
    // Early race
    zones.push({
      km: 2,
      action: 'Settle into rhythm. Don\'t get caught up in fast starters',
    });

    // Mid-race
    if (distance >= 10) {
      zones.push({
        km: Math.floor(distance * 0.4),
        action: 'Conserve energy. This is where races are lost, not won',
      });
    }

    // Late race
    if (distance >= 15) {
      zones.push({
        km: Math.floor(distance * 0.75),
        action: 'Time to push. You\'ve conserved energy for this moment',
      });
    }

    return zones;
  }

  private calculateSplits(pacePerKm: number[]): { km: number; targetTime: string }[] {
    const splits: { km: number; targetTime: string }[] = [];
    let cumulativeTime = 0;

    pacePerKm.forEach((pace, km) => {
      cumulativeTime += pace * 60; // Convert to seconds
      const mins = Math.floor(cumulativeTime / 60);
      const secs = Math.round(cumulativeTime % 60);
      splits.push({
        km: km + 1,
        targetTime: `${mins}:${secs.toString().padStart(2, '0')}`,
      });
    });

    return splits;
  }
}

export const RaceStrategyService = new RaceStrategyServiceClass();
