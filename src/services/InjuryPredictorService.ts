import { Run } from '../types';

export interface TrainingLoad {
  acuteLoad: number;      // Last 7 days total distance
  chronicLoad: number;    // Last 28 days average
  ratio: number;          // Acute:Chronic ratio
  rampRate: number;       // Weekly increase %
}

export interface InjuryRiskFactors {
  trainingLoad: TrainingLoad;
  averageCadence: number;
  paceVariation: number;
  sleepHours: number;
  weatherTemp: number;
  previousInjuries: string[];
  consecutiveDays: number;
}

export interface InjuryRiskResult {
  riskScore: number;      // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  warnings: string[];
  recommendations: string[];
  nextAssessment: Date;
}

class InjuryPredictorServiceClass {
  calculateTrainingLoad(runs: Run[]): TrainingLoad {
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twentyEightDaysAgo = now - 28 * 24 * 60 * 60 * 1000;

    // Acute load (last 7 days)
    const acuteRuns = runs.filter(r => r.startTime >= sevenDaysAgo);
    const acuteLoad = acuteRuns.reduce((sum, r) => sum + r.distance, 0) / 1000;

    // Chronic load (last 28 days average per week)
    const chronicRuns = runs.filter(r => r.startTime >= twentyEightDaysAgo);
    const chronicLoad = (chronicRuns.reduce((sum, r) => sum + r.distance, 0) / 1000) / 4;

    // Acute:Chronic ratio
    const ratio = chronicLoad > 0 ? acuteLoad / chronicLoad : 0;

    // Calculate ramp rate (week-over-week increase)
    const twoWeeksAgo = now - 14 * 24 * 60 * 60 * 1000;
    const lastWeekRuns = runs.filter(r => r.startTime >= sevenDaysAgo);
    const previousWeekRuns = runs.filter(r => r.startTime >= twoWeeksAgo && r.startTime < sevenDaysAgo);
    
    const lastWeekDistance = lastWeekRuns.reduce((sum, r) => sum + r.distance, 0) / 1000;
    const previousWeekDistance = previousWeekRuns.reduce((sum, r) => sum + r.distance, 0) / 1000;
    
    const rampRate = previousWeekDistance > 0 
      ? ((lastWeekDistance - previousWeekDistance) / previousWeekDistance) * 100 
      : 0;

    return { acuteLoad, chronicLoad, ratio, rampRate };
  }

  predictInjuryRisk(factors: InjuryRiskFactors): InjuryRiskResult {
    let riskScore = 0;
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 1. Training Load Analysis (40 points max)
    if (factors.trainingLoad.ratio > 1.5) {
      riskScore += 25;
      warnings.push(`High acute:chronic ratio (${factors.trainingLoad.ratio.toFixed(2)})`);
      recommendations.push('Reduce training volume by 20-30% this week');
    } else if (factors.trainingLoad.ratio > 1.3) {
      riskScore += 15;
      warnings.push(`Elevated training load ratio (${factors.trainingLoad.ratio.toFixed(2)})`);
    }

    if (factors.trainingLoad.rampRate > 15) {
      riskScore += 20;
      warnings.push(`Training increased ${factors.trainingLoad.rampRate.toFixed(0)}% (safe limit: 10%)`);
      recommendations.push('Limit weekly increase to 10% or less');
    } else if (factors.trainingLoad.rampRate > 10) {
      riskScore += 10;
      warnings.push(`Training ramping up quickly (${factors.trainingLoad.rampRate.toFixed(0)}%)`);
    }

    // 2. Form Analysis (25 points max)
    if (factors.averageCadence < 150) {
      riskScore += 20;
      warnings.push(`Low cadence (${factors.averageCadence} SPM) increases injury risk`);
      recommendations.push('Work on increasing cadence to 165-180 SPM');
    } else if (factors.averageCadence < 160) {
      riskScore += 10;
      warnings.push(`Cadence could be improved (${factors.averageCadence} SPM)`);
    }

    if (factors.paceVariation > 0.3) {
      riskScore += 15;
      warnings.push('High pace variation indicates fatigue');
      recommendations.push('Focus on consistent pacing');
    }

    // 3. Recovery Analysis (20 points max)
    if (factors.sleepHours < 6) {
      riskScore += 15;
      warnings.push(`Insufficient sleep (${factors.sleepHours}h) impairs recovery`);
      recommendations.push('Aim for 7-9 hours of sleep per night');
    } else if (factors.sleepHours < 7) {
      riskScore += 8;
    }

    if (factors.consecutiveDays > 5) {
      riskScore += 12;
      warnings.push(`${factors.consecutiveDays} consecutive running days without rest`);
      recommendations.push('Take at least 1-2 rest days per week');
    }

    // 4. Environmental Factors (10 points max)
    if (factors.weatherTemp > 30 || factors.weatherTemp < 5) {
      riskScore += 8;
      warnings.push('Extreme temperatures increase injury risk');
      recommendations.push('Adjust pace for weather conditions');
    }

    // 5. Injury History (5 points max)
    if (factors.previousInjuries.length > 0) {
      riskScore += 5;
      warnings.push(`Previous injuries: ${factors.previousInjuries.join(', ')}`);
      recommendations.push('Monitor for recurring pain patterns');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore >= 70) {
      riskLevel = 'critical';
      recommendations.unshift('URGENT: Take 3-5 days complete rest');
    } else if (riskScore >= 50) {
      riskLevel = 'high';
      recommendations.unshift('Take 2-3 rest days immediately');
    } else if (riskScore >= 30) {
      riskLevel = 'medium';
      recommendations.unshift('Reduce intensity and volume by 30%');
    } else {
      riskLevel = 'low';
      recommendations.push('Continue current training with caution');
    }

    // Next assessment in 7 days
    const nextAssessment = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      warnings,
      recommendations,
      nextAssessment,
    };
  }

  getConsecutiveRunDays(runs: Run[]): number {
    if (runs.length === 0) return 0;

    const sortedRuns = [...runs].sort((a, b) => b.startTime - a.startTime);
    let consecutive = 1;
    
    for (let i = 0; i < sortedRuns.length - 1; i++) {
      const daysDiff = (sortedRuns[i].startTime - sortedRuns[i + 1].startTime) / (24 * 60 * 60 * 1000);
      if (daysDiff <= 1.5) {
        consecutive++;
      } else {
        break;
      }
    }

    return consecutive;
  }
}

export const InjuryPredictorService = new InjuryPredictorServiceClass();
