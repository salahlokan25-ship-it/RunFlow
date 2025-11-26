import { getDB } from '../db';

export interface UserProfile {
  id: string;
  userId: string;
  experienceLevel: string;
  activityFrequency: string;
  primaryGoal: string;
  targetDistance?: string;
  preferredActivities: string[];
  notificationPreferences: string[];
  onboardingCompleted: boolean;
  createdAt: number;
}

export const saveUserProfile = async (profile: Omit<UserProfile, 'id' | 'createdAt'>): Promise<void> => {
  const db = getDB();
  const id = `profile_${Date.now()}`;
  
  db.runSync(
    `INSERT INTO user_profile (
      id, userId, experienceLevel, activityFrequency, primaryGoal, 
      targetDistance, preferredActivities, notificationPreferences, 
      onboardingCompleted, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      profile.userId,
      profile.experienceLevel,
      profile.activityFrequency,
      profile.primaryGoal,
      profile.targetDistance || '',
      JSON.stringify(profile.preferredActivities),
      JSON.stringify(profile.notificationPreferences),
      profile.onboardingCompleted ? 1 : 0,
      Date.now()
    ]
  );
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const db = getDB();
  
  const result = db.getFirstSync<any>(
    'SELECT * FROM user_profile WHERE userId = ? ORDER BY createdAt DESC LIMIT 1',
    [userId]
  );

  if (!result) return null;

  return {
    id: result.id,
    userId: result.userId,
    experienceLevel: result.experienceLevel,
    activityFrequency: result.activityFrequency,
    primaryGoal: result.primaryGoal,
    targetDistance: result.targetDistance,
    preferredActivities: JSON.parse(result.preferredActivities || '[]'),
    notificationPreferences: JSON.parse(result.notificationPreferences || '[]'),
    onboardingCompleted: result.onboardingCompleted === 1,
    createdAt: result.createdAt
  };
};

export const hasCompletedOnboarding = async (userId: string): Promise<boolean> => {
  const profile = await getUserProfile(userId);
  return profile?.onboardingCompleted || false;
};
