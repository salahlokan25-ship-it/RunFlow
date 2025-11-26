import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('runflow.db');

export const initDatabase = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      startTime INTEGER,
      endTime INTEGER,
      duration INTEGER,
      distance REAL,
      avgPace REAL,
      calories INTEGER,
      pointsJson TEXT,
      splitsJson TEXT,
      elevationGain REAL,
      elevationLoss REAL,
      activityType TEXT
    );

    CREATE TABLE IF NOT EXISTS user_training_plan (
      id TEXT PRIMARY KEY,
      planId TEXT,
      startDate INTEGER,
      currentWeek INTEGER,
      isActive INTEGER
    );

    CREATE TABLE IF NOT EXISTS completed_workouts (
      id TEXT PRIMARY KEY,
      workoutId TEXT,
      completedDate INTEGER,
      runId TEXT
    );

    CREATE TABLE IF NOT EXISTS mood_tracking (
      id TEXT PRIMARY KEY,
      runId TEXT,
      mood INTEGER,
      energy INTEGER,
      motivation INTEGER,
      stress INTEGER,
      notes TEXT,
      timestamp INTEGER
    );

    CREATE TABLE IF NOT EXISTS gear (
      id TEXT PRIMARY KEY,
      type TEXT,
      brand TEXT,
      model TEXT,
      purchaseDate INTEGER,
      totalMileage REAL,
      runsUsed INTEGER,
      condition TEXT,
      photo TEXT,
      notes TEXT,
      isActive INTEGER,
      costPerMile REAL
    );

    CREATE TABLE IF NOT EXISTS saved_routes (
      id TEXT PRIMARY KEY,
      name TEXT,
      distance REAL,
      elevationGain REAL,
      safetyScore INTEGER,
      waypointsJson TEXT,
      timesCompleted INTEGER,
      bestTime INTEGER,
      notes TEXT,
      createdAt INTEGER
    );

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      userId TEXT,
      experienceLevel TEXT,
      activityFrequency TEXT,
      primaryGoal TEXT,
      targetDistance TEXT,
      preferredActivities TEXT,
      notificationPreferences TEXT,
      onboardingCompleted INTEGER,
      createdAt INTEGER
    );
  `);

  // Migrations: Try to add columns if they don't exist
  const migrations = [
    'ALTER TABLE runs ADD COLUMN splitsJson TEXT',
    'ALTER TABLE runs ADD COLUMN pointsJson TEXT',
    'ALTER TABLE runs ADD COLUMN elevationGain REAL',
    'ALTER TABLE runs ADD COLUMN elevationLoss REAL',
    'ALTER TABLE runs ADD COLUMN activityType TEXT'
  ];

  migrations.forEach(query => {
    try {
      db.execSync(query);
    } catch (e) {
      // Column likely exists, ignore error
    }
  });
};

export const getDB = () => db;
