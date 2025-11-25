import { Run } from '../types';

export interface CalorieBreakdown {
  total: number;
  carbs: number;           // Calories from carbs
  fat: number;             // Calories from fat
  glycogen: number;        // Glycogen depletion (grams)
  percentages: {
    carbs: number;
    fat: number;
  };
  intensity: 'low' | 'medium' | 'high';
}

class CalorieBreakdownServiceClass {
  calculateBreakdown(run: Run, userWeight: number = 70): CalorieBreakdown {
    const { distance, duration, pace } = run;
    const distanceKm = distance / 1000;
    
    // Base calorie calculation (rough estimate)
    const totalCalories = Math.round(distanceKm * userWeight * 1.036);

    // Determine intensity based on pace
    let intensity: 'low' | 'medium' | 'high';
    let carbsPercentage: number;
    let fatPercentage: number;

    if (pace < 4.5) {
      // High intensity (fast pace)
      intensity = 'high';
      carbsPercentage = 0.85;
      fatPercentage = 0.15;
    } else if (pace < 5.5) {
      // Medium intensity (tempo)
      intensity = 'medium';
      carbsPercentage = 0.60;
      fatPercentage = 0.40;
    } else {
      // Low intensity (easy)
      intensity = 'low';
      carbsPercentage = 0.40;
      fatPercentage = 0.60;
    }

    const carbsCalories = Math.round(totalCalories * carbsPercentage);
    const fatCalories = Math.round(totalCalories * fatPercentage);

    // Glycogen calculation (1g glycogen = 4 calories)
    const glycogenGrams = Math.round(carbsCalories / 4);

    return {
      total: totalCalories,
      carbs: carbsCalories,
      fat: fatCalories,
      glycogen: glycogenGrams,
      percentages: {
        carbs: Math.round(carbsPercentage * 100),
        fat: Math.round(fatPercentage * 100),
      },
      intensity,
    };
  }

  getRefuelRecommendation(breakdown: CalorieBreakdown): string {
    const { carbs, glycogen } = breakdown;

    if (glycogen > 100) {
      return `High glycogen depletion (${glycogen}g). Refuel with 30-50g carbs within 30 minutes.`;
    } else if (glycogen > 50) {
      return `Moderate glycogen use (${glycogen}g). Consider a snack with 20-30g carbs.`;
    } else {
      return `Low glycogen depletion (${glycogen}g). Normal meal timing is fine.`;
    }
  }
}

export const CalorieBreakdownService = new CalorieBreakdownServiceClass();
