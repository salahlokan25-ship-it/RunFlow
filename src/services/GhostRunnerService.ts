import { Run, GPSPoint } from '../types';

export interface GhostRunner {
  type: 'personal-best' | 'target-pace';
  runId?: string;
  run?: Run;
  targetPace?: number;
  currentDistance: number;
  ghostDistance: number;
  timeDifference: number;  // Positive = ahead, negative = behind
  status: 'ahead' | 'behind' | 'tied';
}

class GhostRunnerServiceClass {
  private ghostRun: Run | null = null;
  private targetPace: number | null = null;
  private startTime: number = 0;

  setupPersonalBest(run: Run) {
    this.ghostRun = run;
    this.targetPace = null;
    this.startTime = Date.now();
  }

  setupTargetPace(paceMinPerKm: number) {
    this.ghostRun = null;
    this.targetPace = paceMinPerKm;
    this.startTime = Date.now();
  }

  calculateGhostPosition(currentDistance: number, elapsedTime: number): GhostRunner {
    let ghostDistance = 0;
    let timeDifference = 0;

    if (this.ghostRun) {
      // Personal best mode
      // Calculate where ghost should be at this elapsed time
      const ghostPace = this.ghostRun.pace;
      ghostDistance = (elapsedTime / 60) / ghostPace * 1000; // meters

      timeDifference = currentDistance - ghostDistance;
    } else if (this.targetPace) {
      // Target pace mode
      ghostDistance = (elapsedTime / 60) / this.targetPace * 1000; // meters
      timeDifference = currentDistance - ghostDistance;
    }

    const status: 'ahead' | 'behind' | 'tied' = 
      timeDifference > 5 ? 'ahead' : 
      timeDifference < -5 ? 'behind' : 'tied';

    return {
      type: this.ghostRun ? 'personal-best' : 'target-pace',
      runId: this.ghostRun?.id,
      run: this.ghostRun || undefined,
      targetPace: this.targetPace || undefined,
      currentDistance,
      ghostDistance,
      timeDifference,
      status,
    };
  }

  getComparisonMessage(ghost: GhostRunner): string {
    const distanceDiff = Math.abs(ghost.timeDifference);
    
    if (ghost.status === 'ahead') {
      return `You're ${distanceDiff.toFixed(0)}m ahead!`;
    } else if (ghost.status === 'behind') {
      return `${distanceDiff.toFixed(0)}m behind. Push harder!`;
    } else {
      return `Neck and neck!`;
    }
  }

  reset() {
    this.ghostRun = null;
    this.targetPace = null;
    this.startTime = 0;
  }
}

export const GhostRunnerService = new GhostRunnerServiceClass();
