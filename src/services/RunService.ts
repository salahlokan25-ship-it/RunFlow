import { getDB } from '../db';
import { Run } from '../types';
import * as Crypto from 'expo-crypto';

export const saveRun = async (run: Omit<Run, 'id'>) => {
  const db = getDB();
  const id = Crypto.randomUUID();
  
  await db.runAsync(
    'INSERT INTO runs (id, startTime, endTime, duration, distance, avgPace, calories, pointsJson, splitsJson, elevationGain, elevationLoss) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    id,
    run.startTime,
    run.endTime,
    run.duration,
    run.distance,
    run.avgPace,
    run.calories,
    JSON.stringify(run.points),
    JSON.stringify(run.splits || []),
    run.elevationGain || 0,
    run.elevationLoss || 0
  );
};

export const getAllRuns = async (): Promise<Run[]> => {
  const db = getDB();
  const result = await db.getAllAsync('SELECT * FROM runs ORDER BY startTime DESC');
  return result.map((r: any) => ({
    ...r,
    points: JSON.parse(r.pointsJson || '[]'),
    splits: JSON.parse(r.splitsJson || '[]'),
  }));
};

export const getRunById = async (id: string): Promise<Run | null> => {
  const db = getDB();
  const result = await db.getFirstAsync('SELECT * FROM runs WHERE id = ?', id);
  if (!result) return null;
  
  const r: any = result;
  return {
    ...r,
    points: JSON.parse(r.pointsJson || '[]'),
    splits: JSON.parse(r.splitsJson || '[]'),
  };
};
