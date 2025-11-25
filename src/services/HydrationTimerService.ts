import * as Notifications from 'expo-notifications';

export interface HydrationStrategy {
  interval: number;        // Minutes
  amount: string;          // "150ml"
  temperature: number;     // Celsius
  totalReminders: number;
  nextReminderTime: number;
}

class HydrationTimerServiceClass {
  private timerId: NodeJS.Timeout | null = null;
  private reminderCount: number = 0;

  calculateStrategy(runDuration: number, temperature: number): HydrationStrategy {
    // Adjust interval based on temperature
    let interval = 20; // Default 20 minutes
    
    if (temperature > 30) {
      interval = 12; // Every 12 min in extreme heat
    } else if (temperature > 25) {
      interval = 15; // Every 15 min in heat
    } else if (temperature > 20) {
      interval = 18; // Every 18 min in warm
    }

    // Amount based on temperature
    let amount = '150ml';
    if (temperature > 25) {
      amount = '200ml';
    } else if (temperature > 30) {
      amount = '250ml';
    }

    const totalReminders = Math.floor(runDuration / interval);

    return {
      interval,
      amount,
      temperature,
      totalReminders,
      nextReminderTime: interval * 60 * 1000, // Convert to ms
    };
  }

  async startTimer(strategy: HydrationStrategy, onReminder: () => void) {
    this.reminderCount = 0;

    const scheduleNext = () => {
      this.timerId = setTimeout(() => {
        this.reminderCount++;
        onReminder();
        
        if (this.reminderCount < strategy.totalReminders) {
          scheduleNext();
        }
      }, strategy.nextReminderTime);
    };

    scheduleNext();
  }

  stopTimer() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.reminderCount = 0;
  }

  getReminderCount(): number {
    return this.reminderCount;
  }
}

export const HydrationTimerService = new HydrationTimerServiceClass();
