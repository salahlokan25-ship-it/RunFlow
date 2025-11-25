import { getDB } from '../db';

export interface MoodData {
  id: string;
  runId: string;
  mood: number;            // 1-10 scale
  energy: number;          // 1-10 scale
  motivation: number;      // 1-10 scale
  stress: number;          // 1-10 scale
  notes?: string;
  timestamp: number;
}

export interface MoodInsights {
  averageMood: number;
  averageEnergy: number;
  bestTimeOfDay: 'morning' | 'afternoon' | 'evening';
  moodTrend: 'improving' | 'stable' | 'declining';
  correlations: {
    distanceVsMood: number;
    paceVsMood: number;
  };
}

class MoodTrackingServiceClass {
  async saveMoodData(moodData: Omit<MoodData, 'id' | 'timestamp'>): Promise<void> {
    const db = getDB();
    const id = Date.now().toString();
    const timestamp = Date.now();

    await db.runAsync(
      `INSERT INTO mood_tracking (id, runId, mood, energy, motivation, stress, notes, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, moodData.runId, moodData.mood, moodData.energy, moodData.motivation, 
       moodData.stress, moodData.notes || '', timestamp]
    );
  }

  async getMoodData(runId: string): Promise<MoodData | null> {
    const db = getDB();
    const result = await db.getFirstAsync<MoodData>(
      'SELECT * FROM mood_tracking WHERE runId = ?',
      [runId]
    );
    return result || null;
  }

  async getAllMoodData(): Promise<MoodData[]> {
    const db = getDB();
    const results = await db.getAllAsync<MoodData>(
      'SELECT * FROM mood_tracking ORDER BY timestamp DESC'
    );
    return results;
  }

  async getMoodInsights(): Promise<MoodInsights> {
    const allData = await this.getAllMoodData();
    
    if (allData.length === 0) {
      return {
        averageMood: 5,
        averageEnergy: 5,
        bestTimeOfDay: 'morning',
        moodTrend: 'stable',
        correlations: { distanceVsMood: 0, paceVsMood: 0 },
      };
    }

    const averageMood = allData.reduce((sum, d) => sum + d.mood, 0) / allData.length;
    const averageEnergy = allData.reduce((sum, d) => sum + d.energy, 0) / allData.length;

    // Determine best time of day
    const timeOfDayScores = { morning: 0, afternoon: 0, evening: 0 };
    allData.forEach(data => {
      const hour = new Date(data.timestamp).getHours();
      if (hour < 12) timeOfDayScores.morning += data.mood;
      else if (hour < 18) timeOfDayScores.afternoon += data.mood;
      else timeOfDayScores.evening += data.mood;
    });

    const bestTimeOfDay = Object.entries(timeOfDayScores).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0] as 'morning' | 'afternoon' | 'evening';

    // Calculate trend (last 10 vs previous 10)
    const recent = allData.slice(0, 10);
    const previous = allData.slice(10, 20);
    
    let moodTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (recent.length > 0 && previous.length > 0) {
      const recentAvg = recent.reduce((sum, d) => sum + d.mood, 0) / recent.length;
      const previousAvg = previous.reduce((sum, d) => sum + d.mood, 0) / previous.length;
      
      if (recentAvg > previousAvg + 0.5) moodTrend = 'improving';
      else if (recentAvg < previousAvg - 0.5) moodTrend = 'declining';
    }

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      bestTimeOfDay,
      moodTrend,
      correlations: { distanceVsMood: 0, paceVsMood: 0 }, // TODO: Calculate
    };
  }
}

export const MoodTrackingService = new MoodTrackingServiceClass();
