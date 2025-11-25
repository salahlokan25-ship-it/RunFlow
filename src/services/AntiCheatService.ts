import { Run, GPSPoint } from '../types';

export interface CheatIndicators {
  unrealisticSpeed: boolean;
  gpsGlitches: boolean;
  abnormalCadence: boolean;
  cyclingPattern: boolean;
  straightLines: boolean;
  elevationMismatch: boolean;
}

export interface CheatDetectionResult {
  isCheating: boolean;
  confidence: number;           // 0-100%
  reasons: string[];
  trustScore: number;           // User's overall trust score
  verified: boolean;
}

class AntiCheatServiceClass {
  detectCheating(run: Run): CheatDetectionResult {
    const indicators: CheatIndicators = {
      unrealisticSpeed: this.checkUnrealisticSpeed(run),
      gpsGlitches: false, // Would check GPS points
      abnormalCadence: false, // Would check cadence data
      cyclingPattern: this.checkCyclingPattern(run),
      straightLines: false, // Would check GPS path
      elevationMismatch: false, // Would check elevation vs map data
    };

    const reasons: string[] = [];
    let suspicionScore = 0;

    // Check each indicator
    if (indicators.unrealisticSpeed) {
      suspicionScore += 40;
      reasons.push('Sustained pace faster than world-class athletes');
    }

    if (indicators.cyclingPattern) {
      suspicionScore += 35;
      reasons.push('Speed and cadence pattern matches cycling, not running');
    }

    if (indicators.gpsGlitches) {
      suspicionScore += 20;
      reasons.push('GPS shows impossible jumps or teleporting');
    }

    if (indicators.abnormalCadence) {
      suspicionScore += 15;
      reasons.push('Cadence doesn\'t match pace (impossible for running)');
    }

    if (indicators.straightLines) {
      suspicionScore += 10;
      reasons.push('GPS path shows perfectly straight lines');
    }

    if (indicators.elevationMismatch) {
      suspicionScore += 15;
      reasons.push('Elevation data doesn\'t match known terrain');
    }

    const isCheating = suspicionScore >= 50;
    const confidence = Math.min(suspicionScore, 100);

    return {
      isCheating,
      confidence,
      reasons,
      trustScore: 100 - confidence, // Inverse of suspicion
      verified: !isCheating && confidence < 20,
    };
  }

  private checkUnrealisticSpeed(run: Run): boolean {
    const { pace, distance } = run;
    const distanceKm = distance / 1000;

    // World record pace for different distances
    const worldRecordPaces: Record<number, number> = {
      5: 2.62,    // 5K: 12:35 (2:37/km)
      10: 2.64,   // 10K: 26:11 (2:37/km)
      21: 2.78,   // Half: 58:01 (2:46/km)
      42: 2.91,   // Marathon: 2:01:09 (2:54/km)
    };

    // Find closest distance
    const distances = [5, 10, 21, 42];
    const closest = distances.reduce((prev, curr) =>
      Math.abs(curr - distanceKm) < Math.abs(prev - distanceKm) ? curr : prev
    );

    const wrPace = worldRecordPaces[closest];

    // Flag if faster than world record - 30 seconds
    return pace < wrPace - 0.5;
  }

  private checkCyclingPattern(run: Run): boolean {
    const { pace, distance } = run;
    
    // Cycling speeds are typically 20-30 km/h (3:00-2:00 min/km)
    // Running speeds rarely exceed 15 km/h (4:00 min/km) for long distances
    
    if (pace < 3.0 && distance > 10000) {
      // Very fast pace for long distance - suspicious
      return true;
    }

    return false;
  }

  calculateUserTrustScore(runs: Run[]): number {
    if (runs.length === 0) return 50; // Neutral for new users

    let totalScore = 0;
    let verifiedRuns = 0;
    let flaggedRuns = 0;

    runs.forEach(run => {
      const result = this.detectCheating(run);
      if (result.verified) {
        verifiedRuns++;
        totalScore += 100;
      } else if (result.isCheating) {
        flaggedRuns++;
        totalScore += 0;
      } else {
        totalScore += result.trustScore;
      }
    });

    const avgScore = totalScore / runs.length;

    // Penalize if high percentage of flagged runs
    const flaggedPercentage = (flaggedRuns / runs.length) * 100;
    const penalty = flaggedPercentage * 2;

    return Math.max(0, Math.min(100, avgScore - penalty));
  }

  getTrustBadge(trustScore: number): 'trusted' | 'verified' | 'neutral' | 'suspicious' {
    if (trustScore >= 90) return 'trusted';
    if (trustScore >= 70) return 'verified';
    if (trustScore >= 40) return 'neutral';
    return 'suspicious';
  }
}

export const AntiCheatService = new AntiCheatServiceClass();
