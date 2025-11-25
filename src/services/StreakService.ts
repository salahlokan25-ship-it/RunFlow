import { Run } from '../types';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalRunDays: number;
  calendar: DayData[];
}

export interface DayData {
  date: string;           // YYYY-MM-DD
  hasRun: boolean;
  isRestDay: boolean;
  distance: number;
  intensity: 'low' | 'medium' | 'high';
}

class StreakServiceClass {
  calculateStreak(runs: Run[]): StreakData {
    const today = new Date();
    const calendar: DayData[] = [];
    
    // Generate last 365 days
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Check if there's a run on this day
      const dayRuns = runs.filter(run => {
        const runDate = new Date(run.startTime).toISOString().split('T')[0];
        return runDate === dateStr;
      });

      const hasRun = dayRuns.length > 0;
      const totalDistance = dayRuns.reduce((sum, r) => sum + r.distance, 0);
      
      let intensity: 'low' | 'medium' | 'high' = 'low';
      if (totalDistance > 10000) intensity = 'high';
      else if (totalDistance > 5000) intensity = 'medium';

      calendar.push({
        date: dateStr,
        hasRun,
        isRestDay: false, // TODO: Detect planned rest days
        distance: totalDistance,
        intensity,
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    for (let i = calendar.length - 1; i >= 0; i--) {
      if (calendar[i].hasRun) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    calendar.forEach(day => {
      if (day.hasRun) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    const totalRunDays = calendar.filter(d => d.hasRun).length;

    return {
      currentStreak,
      longestStreak,
      totalRunDays,
      calendar,
    };
  }

  getStreakMilestone(streak: number): { title: string; emoji: string } | null {
    const milestones = [
      { days: 7, title: '7-Day Streak!', emoji: '🔥' },
      { days: 30, title: '30-Day Streak!', emoji: '💪' },
      { days: 50, title: '50-Day Streak!', emoji: '⭐' },
      { days: 100, title: '100-Day Streak!', emoji: '🏆' },
      { days: 365, title: 'Full Year Streak!', emoji: '👑' },
    ];

    return milestones.find(m => m.days === streak) || null;
  }
}

export const StreakService = new StreakServiceClass();
