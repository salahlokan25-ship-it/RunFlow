import { TrainingPlan, Workout, WeekData } from '../types';

// Pre-built training plans
const TRAINING_PLANS: TrainingPlan[] = [
  {
    id: '5k-beginner',
    name: '5K Beginner',
    description: 'Perfect for first-time runners. Build up to running 5K in 8 weeks.',
    level: 'beginner',
    distance: '5K',
    durationWeeks: 8,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: '5k-beg-w1-d1',
            dayOfWeek: 1,
            type: 'easy',
            name: 'Easy Run',
            description: 'Run at a comfortable pace where you can hold a conversation.',
            duration: 1200, // 20 minutes
          },
          {
            id: '5k-beg-w1-d3',
            dayOfWeek: 3,
            type: 'easy',
            name: 'Easy Run',
            description: 'Run at a comfortable pace.',
            duration: 1500, // 25 minutes
          },
          {
            id: '5k-beg-w1-d5',
            dayOfWeek: 5,
            type: 'easy',
            name: 'Easy Run',
            description: 'Run at a comfortable pace.',
            duration: 1200, // 20 minutes
          },
        ],
      },
      {
        weekNumber: 2,
        workouts: [
          {
            id: '5k-beg-w2-d1',
            dayOfWeek: 1,
            type: 'easy',
            name: 'Easy Run',
            description: 'Run at a comfortable pace.',
            duration: 1500, // 25 minutes
          },
          {
            id: '5k-beg-w2-d3',
            dayOfWeek: 3,
            type: 'easy',
            name: 'Easy Run',
            description: 'Run at a comfortable pace.',
            duration: 1800, // 30 minutes
          },
          {
            id: '5k-beg-w2-d5',
            dayOfWeek: 5,
            type: 'easy',
            name: 'Easy Run',
            description: 'Run at a comfortable pace.',
            duration: 1500, // 25 minutes
          },
        ],
      },
      // Week 3-7 would continue building...
      {
        weekNumber: 8,
        workouts: [
          {
            id: '5k-beg-w8-d1',
            dayOfWeek: 1,
            type: 'easy',
            name: 'Easy Run',
            description: 'Light recovery run.',
            duration: 1200, // 20 minutes
          },
          {
            id: '5k-beg-w8-d3',
            dayOfWeek: 3,
            type: 'tempo',
            name: 'Tempo Run',
            description: 'Run at a comfortably hard pace for 15 minutes.',
            duration: 900, // 15 minutes
          },
          {
            id: '5k-beg-w8-d6',
            dayOfWeek: 6,
            type: 'easy',
            name: '5K Race Day!',
            description: 'Your goal race! Run at a steady, sustainable pace.',
            distance: 5000,
          },
        ],
      },
    ],
  },
  {
    id: '10k-intermediate',
    name: '10K Intermediate',
    description: 'For runners with a base. Build speed and endurance for 10K.',
    level: 'intermediate',
    distance: '10K',
    durationWeeks: 10,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: '10k-int-w1-d1',
            dayOfWeek: 1,
            type: 'easy',
            name: 'Easy Run',
            description: 'Comfortable pace.',
            duration: 2400, // 40 minutes
          },
          {
            id: '10k-int-w1-d3',
            dayOfWeek: 3,
            type: 'intervals',
            name: 'Interval Training',
            description: 'Speed work to build fitness.',
            intervals: [
              { type: 'warmup', duration: 600 }, // 10 min warmup
              { type: 'work', duration: 180, repeat: 6 }, // 6x 3 min work
              { type: 'rest', duration: 90, repeat: 6 }, // 6x 1.5 min rest
              { type: 'cooldown', duration: 600 }, // 10 min cooldown
            ],
          },
          {
            id: '10k-int-w1-d6',
            dayOfWeek: 6,
            type: 'long',
            name: 'Long Run',
            description: 'Build endurance at easy pace.',
            duration: 3600, // 60 minutes
          },
        ],
      },
      // Additional weeks...
      {
        weekNumber: 10,
        workouts: [
          {
            id: '10k-int-w10-d3',
            dayOfWeek: 3,
            type: 'easy',
            name: 'Easy Run',
            description: 'Taper week - keep it light.',
            duration: 1800, // 30 minutes
          },
          {
            id: '10k-int-w10-d6',
            dayOfWeek: 6,
            type: 'easy',
            name: '10K Race Day!',
            description: 'Race day! Trust your training.',
            distance: 10000,
          },
        ],
      },
    ],
  },
  {
    id: 'half-marathon-advanced',
    name: 'Half Marathon Advanced',
    description: 'Push your limits. Aim for a sub-1:45 half marathon.',
    level: 'advanced',
    distance: 'Half Marathon',
    durationWeeks: 12,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: 'hm-adv-w1-d1',
            dayOfWeek: 1,
            type: 'easy',
            name: 'Base Building',
            description: 'Steady pace to build aerobic capacity.',
            duration: 3000, // 50 mins
          },
          {
            id: 'hm-adv-w1-d3',
            dayOfWeek: 3,
            type: 'intervals',
            name: 'Speed Work',
            description: '8x 400m at goal pace.',
            intervals: [
              { type: 'warmup', duration: 900 },
              { type: 'work', duration: 90, repeat: 8 }, // Approx 400m
              { type: 'rest', duration: 90, repeat: 8 },
              { type: 'cooldown', duration: 900 },
            ],
          },
          {
            id: 'hm-adv-w1-d6',
            dayOfWeek: 6,
            type: 'long',
            name: 'Long Run',
            description: '14km steady run.',
            distance: 14000,
          },
        ],
      },
      // ... more weeks
    ],
  },
  {
    id: 'marathon-beginner',
    name: 'Marathon Beginner',
    description: 'Your first 42.2km. Focus on finishing strong.',
    level: 'beginner',
    distance: 'Marathon',
    durationWeeks: 16,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: 'mar-beg-w1-d2',
            dayOfWeek: 2,
            type: 'easy',
            name: 'Short Run',
            description: 'Get the legs moving.',
            duration: 1800, // 30 mins
          },
          {
            id: 'mar-beg-w1-d4',
            dayOfWeek: 4,
            type: 'easy',
            name: 'Medium Run',
            description: 'Comfortable pace.',
            duration: 2700, // 45 mins
          },
          {
            id: 'mar-beg-w1-d7',
            dayOfWeek: 0,
            type: 'long',
            name: 'Long Run',
            description: 'Slow and steady.',
            distance: 10000, // 10km
          },
        ],
      },
      // ... more weeks
    ],
  },
  {
    id: 'c25k',
    name: 'Couch to 5K',
    description: 'From zero to hero. Walk/Run intervals to get you started.',
    level: 'beginner',
    distance: '5K',
    durationWeeks: 9,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: 'c25k-w1-d1',
            dayOfWeek: 1,
            type: 'intervals',
            name: 'Week 1 Run 1',
            description: 'Alternating walking and running.',
            intervals: [
              { type: 'warmup', duration: 300 }, // 5 min walk
              { type: 'work', duration: 60, repeat: 8 }, // 60s run
              { type: 'rest', duration: 90, repeat: 8 }, // 90s walk
              { type: 'cooldown', duration: 300 }, // 5 min walk
            ],
          },
          {
            id: 'c25k-w1-d3',
            dayOfWeek: 3,
            type: 'intervals',
            name: 'Week 1 Run 2',
            description: 'Alternating walking and running.',
            intervals: [
              { type: 'warmup', duration: 300 },
              { type: 'work', duration: 60, repeat: 8 },
              { type: 'rest', duration: 90, repeat: 8 },
              { type: 'cooldown', duration: 300 },
            ],
          },
          {
            id: 'c25k-w1-d5',
            dayOfWeek: 5,
            type: 'intervals',
            name: 'Week 1 Run 3',
            description: 'Alternating walking and running.',
            intervals: [
              { type: 'warmup', duration: 300 },
              { type: 'work', duration: 60, repeat: 8 },
              { type: 'rest', duration: 90, repeat: 8 },
              { type: 'cooldown', duration: 300 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'marathon-mastery',
    name: 'Marathon Mastery: Sub-3',
    description: 'Advanced pyramidal training for experienced runners aiming for a sub-3 hour marathon.',
    level: 'advanced',
    distance: 'Marathon',
    durationWeeks: 18,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: 'mm-w1-d1',
            dayOfWeek: 1,
            type: 'easy',
            name: 'Easy Aerobic Run',
            description: 'Keep HR in Zone 2. Build volume.',
            duration: 3600, // 60 mins
          },
          {
            id: 'mm-w1-d3',
            dayOfWeek: 3,
            type: 'intervals',
            name: 'Threshold Intervals',
            description: '3x 10min at threshold pace with 2min recovery.',
            intervals: [
              { type: 'warmup', duration: 900 },
              { type: 'work', duration: 600, repeat: 3 },
              { type: 'rest', duration: 120, repeat: 3 },
              { type: 'cooldown', duration: 900 },
            ],
          },
          {
            id: 'mm-w1-d6',
            dayOfWeek: 6,
            type: 'long',
            name: 'Long Run with MP',
            description: '24km total with last 5km at Marathon Pace.',
            distance: 24000,
          },
        ],
      },
    ],
  },
  {
    id: 'first-marathon-finish',
    name: 'First Marathon: Finish Strong',
    description: 'Comprehensive plan for first-timers focusing on endurance and cross-training.',
    level: 'beginner',
    distance: 'Marathon',
    durationWeeks: 20,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: 'fm-w1-d2',
            dayOfWeek: 2,
            type: 'easy',
            name: 'Easy Run',
            description: 'Conversational pace.',
            duration: 1800, // 30 mins
          },
          {
            id: 'fm-w1-d4',
            dayOfWeek: 4,
            type: 'cross-training',
            name: 'Cross Training',
            description: 'Cycling or Swimming to build aerobic base without impact.',
            duration: 2700, // 45 mins
          },
          {
            id: 'fm-w1-d7',
            dayOfWeek: 0,
            type: 'long',
            name: 'Long Run',
            description: 'Walk/Run strategy allowed. Time on feet is key.',
            distance: 8000, // 8km
          },
        ],
      },
    ],
  },
  {
    id: 'injury-prevention',
    name: 'Injury Prevention & Recovery',
    description: 'Supplemental strength and mobility routines to keep you running healthy.',
    level: 'all',
    distance: 'N/A',
    durationWeeks: 4,
    weeks: [
      {
        weekNumber: 1,
        workouts: [
          {
            id: 'ip-w1-d1',
            dayOfWeek: 1,
            type: 'strength',
            name: 'Glute & Core Strength',
            description: 'Clamshells, Bridges, Planks. 3 sets of 15 reps.',
            duration: 1200, // 20 mins
          },
          {
            id: 'ip-w1-d3',
            dayOfWeek: 3,
            type: 'mobility',
            name: 'Hip Mobility Flow',
            description: '90/90 stretch, Pigeon pose, Lunges.',
            duration: 900, // 15 mins
          },
        ],
      },
    ],
  },
];

export const getTrainingPlans = (): TrainingPlan[] => {
  return TRAINING_PLANS;
};

export const getTrainingPlanById = (id: string): TrainingPlan | null => {
  return TRAINING_PLANS.find((plan) => plan.id === id) || null;
};

export const getCurrentWeekWorkouts = (
  planId: string,
  weekNumber: number
): Workout[] => {
  const plan = getTrainingPlanById(planId);
  if (!plan) return [];

  const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
  return week?.workouts || [];
};
