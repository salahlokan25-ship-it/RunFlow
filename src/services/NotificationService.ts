import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationPreferences {
  dailyReminder: boolean;
  dailyReminderTime: { hour: number; minute: number };
  weeklyReports: boolean;
  achievements: boolean;
  trainingTips: boolean;
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return false;
  }

  return true;
};

export const scheduleDailyReminder = async (hour: number, minute: number): Promise<string | null> => {
  try {
    // Cancel existing daily reminders
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of scheduled) {
      if (notification.content.data?.type === 'daily_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Schedule new daily reminder
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to Run! 🏃",
        body: "Let's keep that streak going! Your body will thank you.",
        data: { type: 'daily_reminder' },
        sound: true,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });

    return id;
  } catch (error) {
    console.error('Error scheduling daily reminder:', error);
    return null;
  }
};

export const sendAchievementNotification = async (title: string, body: string): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `🎉 ${title}`,
        body,
        data: { type: 'achievement' },
        sound: true,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending achievement notification:', error);
  }
};

export const sendWeeklySummary = async (stats: {
  totalDistance: number;
  totalRuns: number;
  totalDuration: number;
}): Promise<void> => {
  try {
    const distanceKm = (stats.totalDistance / 1000).toFixed(1);
    const durationHours = Math.floor(stats.totalDuration / 3600);
    const durationMinutes = Math.floor((stats.totalDuration % 3600) / 60);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📊 Your Weekly Summary",
        body: `${stats.totalRuns} runs • ${distanceKm} km • ${durationHours}h ${durationMinutes}m. Keep it up!`,
        data: { type: 'weekly_summary' },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending weekly summary:', error);
  }
};

export const sendTrainingReminder = async (workoutName: string, time: Date): Promise<string | null> => {
  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🏋️ Training Reminder",
        body: `Don't forget: ${workoutName}`,
        data: { type: 'training_reminder' },
        sound: true,
      },
      trigger: time,
    });

    return id;
  } catch (error) {
    console.error('Error scheduling training reminder:', error);
    return null;
  }
};

export const sendMotivationalMessage = async (): Promise<void> => {
  const messages = [
    "You're on a roll! Keep that streak alive! 🔥",
    "Every step counts. You've got this! 💪",
    "Your future self will thank you for this run! 🌟",
    "Champions are made in training. Let's go! 🏆",
    "The only bad workout is the one you didn't do! ⚡",
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "💪 Stay Motivated",
        body: randomMessage,
        data: { type: 'motivation' },
        sound: true,
      },
      trigger: null,
    });
  } catch (error) {
    console.error('Error sending motivational message:', error);
  }
};

export const cancelAllNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

export const getScheduledNotifications = async () => {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
};
