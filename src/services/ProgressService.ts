import { getDB } from '../db';
import { UserTrainingPlan, CompletedWorkout } from '../types';
import * as Crypto from 'expo-crypto';

export const startTrainingPlan = async (planId: string): Promise<void> => {
  const db = getDB();
  
  // Deactivate any existing active plans
  await db.runAsync('UPDATE user_training_plan SET isActive = 0 WHERE isActive = 1');
  
  // Create new active plan
  const id = Crypto.randomUUID();
  await db.runAsync(
    'INSERT INTO user_training_plan (id, planId, startDate, currentWeek, isActive) VALUES (?, ?, ?, ?, ?)',
    id,
    planId,
    Date.now(),
    1,
    1
  );
};

export const getActiveTrainingPlan = async (): Promise<UserTrainingPlan | null> => {
  const db = getDB();
  const result = await db.getFirstAsync(
    'SELECT * FROM user_training_plan WHERE isActive = 1'
  );
  
  if (!result) return null;
  
  const r: any = result;
  return {
    id: r.id,
    planId: r.planId,
    startDate: r.startDate,
    currentWeek: r.currentWeek,
    isActive: r.isActive === 1,
  };
};

export const markWorkoutComplete = async (
  workoutId: string,
  runId?: string
): Promise<void> => {
  const db = getDB();
  const id = Crypto.randomUUID();
  
  await db.runAsync(
    'INSERT INTO completed_workouts (id, workoutId, completedDate, runId) VALUES (?, ?, ?, ?)',
    id,
    workoutId,
    Date.now(),
    runId || null
  );
};

export const getCompletedWorkouts = async (): Promise<CompletedWorkout[]> => {
  const db = getDB();
  const result = await db.getAllAsync('SELECT * FROM completed_workouts ORDER BY completedDate DESC');
  
  return result.map((r: any) => ({
    id: r.id,
    workoutId: r.workoutId,
    completedDate: r.completedDate,
    runId: r.runId,
  }));
};

export const isWorkoutCompleted = async (workoutId: string): Promise<boolean> => {
  const db = getDB();
  const result = await db.getFirstAsync(
    'SELECT id FROM completed_workouts WHERE workoutId = ?',
    workoutId
  );
  return result !== null;
};

export const getWeeklyProgress = async (
  planId: string,
  weekNumber: number,
  workoutIds: string[]
): Promise<{ completed: number; total: number }> => {
  const completedWorkouts = await getCompletedWorkouts();
  const completedIds = new Set(completedWorkouts.map((w) => w.workoutId));
  
  const completed = workoutIds.filter((id) => completedIds.has(id)).length;
  
  return {
    completed,
    total: workoutIds.length,
  };
};

export const updateCurrentWeek = async (weekNumber: number): Promise<void> => {
  const db = getDB();
  await db.runAsync(
    'UPDATE user_training_plan SET currentWeek = ? WHERE isActive = 1',
    weekNumber
  );
};
