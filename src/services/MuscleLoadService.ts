import { Run } from '../types';

export interface MuscleLoad {
  quadriceps: number;      // 0-100
  hamstrings: number;
  calves: number;
  glutes: number;
  achillesTendon: number;
  hipFlexors: number;
}

export interface RecoveryRecommendation {
  muscleGroup: string;
  loadLevel: 'low' | 'moderate' | 'high' | 'critical';
  recoveryTime: number;    // Hours
  stretches: string[];
  foamRolling: string[];
  needsRest: boolean;
}

class MuscleLoadServiceClass {
  calculateMuscleLoad(run: Run): MuscleLoad {
    const { pace, distance, elevationGain = 0, elevationLoss = 0 } = run;
    
    // Base load from distance (km)
    const distanceKm = distance / 1000;
    const baseLoad = Math.min(distanceKm * 8, 70);

    // Pace intensity factor (faster = more load)
    const paceIntensity = pace < 4 ? 1.5 : pace < 5 ? 1.2 : 1.0;

    // Elevation factors
    const uphillFactor = elevationGain / 100; // Every 100m adds load
    const downhillFactor = elevationLoss / 100;

    // Calculate individual muscle loads
    const quadriceps = Math.min(baseLoad + (uphillFactor * 15) + (downhillFactor * 10), 100);
    const hamstrings = Math.min(baseLoad * 0.8 + (downhillFactor * 12), 100);
    const calves = Math.min(baseLoad * paceIntensity + (uphillFactor * 10), 100);
    const glutes = Math.min(baseLoad * 0.9 + (uphillFactor * 12), 100);
    const achillesTendon = Math.min((baseLoad * paceIntensity) + (uphillFactor * 8), 100);
    const hipFlexors = Math.min(baseLoad * 0.7 + (paceIntensity * 10), 100);

    return {
      quadriceps: Math.round(quadriceps),
      hamstrings: Math.round(hamstrings),
      calves: Math.round(calves),
      glutes: Math.round(glutes),
      achillesTendon: Math.round(achillesTendon),
      hipFlexors: Math.round(hipFlexors),
    };
  }

  getRecoveryRecommendations(muscleLoad: MuscleLoad): RecoveryRecommendation[] {
    const recommendations: RecoveryRecommendation[] = [];

    Object.entries(muscleLoad).forEach(([muscle, load]) => {
      let loadLevel: RecoveryRecommendation['loadLevel'];
      let recoveryTime: number;
      let needsRest: boolean;

      if (load >= 85) {
        loadLevel = 'critical';
        recoveryTime = 48;
        needsRest = true;
      } else if (load >= 70) {
        loadLevel = 'high';
        recoveryTime = 36;
        needsRest = true;
      } else if (load >= 50) {
        loadLevel = 'moderate';
        recoveryTime = 24;
        needsRest = false;
      } else {
        loadLevel = 'low';
        recoveryTime = 12;
        needsRest = false;
      }

      const stretches = this.getStretches(muscle);
      const foamRolling = this.getFoamRolling(muscle);

      recommendations.push({
        muscleGroup: this.formatMuscleName(muscle),
        loadLevel,
        recoveryTime,
        stretches,
        foamRolling,
        needsRest,
      });
    });

    return recommendations.sort((a, b) => {
      const loadOrder = { critical: 4, high: 3, moderate: 2, low: 1 };
      return loadOrder[b.loadLevel] - loadOrder[a.loadLevel];
    });
  }

  private getStretches(muscle: string): string[] {
    const stretchMap: Record<string, string[]> = {
      quadriceps: ['Standing quad stretch (30s each leg)', 'Kneeling hip flexor stretch'],
      hamstrings: ['Standing hamstring stretch', 'Seated forward fold'],
      calves: ['Wall calf stretch', 'Downward dog'],
      glutes: ['Figure-4 stretch', 'Pigeon pose'],
      achillesTendon: ['Calf drops', 'Eccentric heel drops'],
      hipFlexors: ['Kneeling lunge stretch', 'Lying hip flexor stretch'],
    };
    return stretchMap[muscle] || [];
  }

  private getFoamRolling(muscle: string): string[] {
    const rollingMap: Record<string, string[]> = {
      quadriceps: ['Roll quads (2 min)', 'Roll IT band'],
      hamstrings: ['Roll hamstrings (2 min)'],
      calves: ['Roll calves (90s each leg)'],
      glutes: ['Roll glutes and piriformis'],
      achillesTendon: ['Gentle calf rolling'],
      hipFlexors: ['Roll hip flexors (gentle)'],
    };
    return rollingMap[muscle] || [];
  }

  private formatMuscleName(muscle: string): string {
    const nameMap: Record<string, string> = {
      quadriceps: 'Quadriceps',
      hamstrings: 'Hamstrings',
      calves: 'Calves',
      glutes: 'Glutes',
      achillesTendon: 'Achilles Tendon',
      hipFlexors: 'Hip Flexors',
    };
    return nameMap[muscle] || muscle;
  }
}

export const MuscleLoadService = new MuscleLoadServiceClass();
