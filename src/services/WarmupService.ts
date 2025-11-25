export interface WarmupFactors {
  runType: 'easy' | 'tempo' | 'intervals' | 'long' | 'race';
  fatigueLevel: number;    // 0-100
  injuryHistory: string[];
  temperature: number;
  timeAvailable: number;   // Minutes
}

export interface Exercise {
  name: string;
  duration?: number;       // Seconds
  reps?: number;
  description: string;
  videoUrl?: string;
  category: 'dynamic' | 'mobility' | 'activation' | 'stretch';
}

export interface WarmupPlan {
  duration: number;
  exercises: Exercise[];
  cooldown: Exercise[];
}

class WarmupServiceClass {
  generateWarmup(factors: WarmupFactors): WarmupPlan {
    const exercises: Exercise[] = [];
    const cooldown: Exercise[] = [];

    // Base warm-up exercises
    const baseExercises: Exercise[] = [
      {
        name: 'Leg Swings',
        duration: 30,
        description: 'Swing each leg forward and back, then side to side',
        category: 'dynamic',
      },
      {
        name: 'Walking Lunges',
        reps: 10,
        description: 'Step forward into lunge, alternating legs',
        category: 'activation',
      },
      {
        name: 'High Knees',
        duration: 20,
        description: 'March in place, bringing knees to hip height',
        category: 'dynamic',
      },
      {
        name: 'Butt Kicks',
        duration: 20,
        description: 'Jog in place, kicking heels to glutes',
        category: 'dynamic',
      },
    ];

    // Add exercises based on run type
    if (factors.runType === 'intervals' || factors.runType === 'tempo') {
      exercises.push(
        {
          name: 'Dynamic Lunges',
          reps: 10,
          description: 'Lunge with torso rotation',
          category: 'activation',
        },
        {
          name: 'A-Skips',
          duration: 20,
          description: 'Skip with exaggerated knee lift',
          category: 'dynamic',
        }
      );
    }

    if (factors.runType === 'race') {
      exercises.push(
        {
          name: 'Strides',
          reps: 4,
          description: '80m accelerations at 85% effort',
          category: 'activation',
        }
      );
    }

    // Add injury-specific exercises
    if (factors.injuryHistory.includes('knee')) {
      exercises.push({
        name: 'Clamshells',
        reps: 15,
        description: 'Lie on side, open top knee while keeping feet together',
        category: 'activation',
      });
    }

    if (factors.injuryHistory.includes('achilles')) {
      exercises.push({
        name: 'Calf Raises',
        reps: 15,
        description: 'Rise up on toes, lower slowly',
        category: 'activation',
      });
    }

    // Adjust for temperature
    if (factors.temperature < 10) {
      exercises.unshift({
        name: 'Light Jog',
        duration: 120,
        description: 'Easy 2-minute jog to warm muscles',
        category: 'dynamic',
      });
    }

    // Cooldown exercises
    cooldown.push(
      {
        name: 'Walking',
        duration: 180,
        description: 'Walk for 3 minutes to bring heart rate down',
        category: 'dynamic',
      },
      {
        name: 'Quad Stretch',
        duration: 30,
        description: 'Pull foot to glute, hold 30 seconds each leg',
        category: 'stretch',
      },
      {
        name: 'Hamstring Stretch',
        duration: 30,
        description: 'Straight leg forward, lean into stretch',
        category: 'stretch',
      },
      {
        name: 'Calf Stretch',
        duration: 30,
        description: 'Push against wall, heel down',
        category: 'stretch',
      },
      {
        name: 'Hip Flexor Stretch',
        duration: 30,
        description: 'Lunge position, push hips forward',
        category: 'stretch',
      }
    );

    // Add breathing exercise for cooldown
    cooldown.push({
      name: 'Deep Breathing',
      duration: 60,
      description: '4-7-8 breathing: Inhale 4s, hold 7s, exhale 8s',
      category: 'stretch',
    });

    // Calculate total duration
    const warmupDuration = exercises.reduce((sum, ex) => {
      return sum + (ex.duration || (ex.reps ? ex.reps * 3 : 0));
    }, 0);

    return {
      duration: Math.round(warmupDuration / 60),
      exercises: [...baseExercises, ...exercises],
      cooldown,
    };
  }
}

export const WarmupService = new WarmupServiceClass();
