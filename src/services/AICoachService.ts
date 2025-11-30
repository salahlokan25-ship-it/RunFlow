import * as Speech from 'expo-speech';
import { RunMetrics } from './SensorService';

export interface CoachingAdvice {
  type: 'pace' | 'heartrate' | 'form' | 'terrain' | 'energy' | 'motivation';
  message: string;
  urgency: 'low' | 'medium' | 'high';
  action: string;
  shouldSpeak: boolean;
}

export interface CoachingContext {
  targetPace?: number;      // Target pace (min/km)
  targetHRZone?: {          // Target heart rate zone
    min: number;
    max: number;
  };
  workoutType: 'easy' | 'tempo' | 'intervals' | 'long' | 'race';
  userFitnessLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

const INITIAL_GREETING: ChatMessage = {
  id: 'init-1',
  text: "Hi! I'm your AI Run Coach. I can help you with training advice, nutrition tips, or race day preparation. What's on your mind?",
  sender: 'ai',
  timestamp: Date.now(),
};

const KNOWLEDGE_BASE = [
  // Tapering & Race Prep
  {
    keywords: ['taper', 'tapering', 'race week', 'before race', 'pre-race'],
    response: "Tapering usually starts 2-3 weeks before your marathon. Reduce your weekly mileage by 20-30% each week, but keep some intensity (like marathon pace intervals) to stay sharp. Focus on sleep and nutrition! The last 3 days before the race, prioritize rest and carb-loading.",
  },
  // Nutrition & Fueling
  {
    keywords: ['eat', 'food', 'nutrition', 'fuel', 'carb', 'protein', 'meal', 'breakfast', 'dinner', 'snack'],
    response: "For long runs, aim for 30-60g of carbs per hour. Before a run, eat something easily digestible like toast with jam or a banana 1-2 hours prior. Post-run, prioritize protein and carbs for recovery within 30 minutes. Daily: 3-5g carbs/kg bodyweight, 1.2-1.6g protein/kg.",
  },
  {
    keywords: ['hydrat', 'water', 'drink', 'fluid', 'electrolyte', 'dehydrat'],
    response: "Hydrate throughout the day, not just before runs. Aim for pale yellow urine. During runs over 60 minutes, drink 150-250ml every 15-20 minutes. Use electrolyte drinks for runs over 90 minutes to replace sodium lost through sweat.",
  },
  {
    keywords: ['gel', 'energy gel', 'gu', 'supplement'],
    response: "Energy gels provide quick carbs (20-25g per gel). Take one every 30-45 minutes during long runs or races. Always practice with gels during training - never try new nutrition on race day! Take with water to aid absorption.",
  },
  // Injury & Pain
  {
    keywords: ['pain', 'hurt', 'injury', 'sore', 'ache', 'shin splint', 'knee', 'ankle', 'foot'],
    response: "If you're feeling sharp pain, stop immediately. General soreness is normal, but persistent pain could be an injury. RICE (Rest, Ice, Compression, Elevation) can help. See a physio if pain persists beyond 3-5 days. Prevention: proper warm-up, gradual mileage increases (10% rule), and strength training.",
  },
  {
    keywords: ['blister', 'chafe', 'chafing', 'skin'],
    response: "Prevent blisters with proper-fitting shoes and moisture-wicking socks. Apply anti-chafe balm (like Body Glide) to problem areas before runs. If you get a blister, don't pop it unless it's very large - let it heal naturally. For chafing, use petroleum jelly or specialized anti-chafe products.",
  },
  {
    keywords: ['recover', 'recovery', 'rest day', 'sore muscle', 'doms'],
    response: "Recovery is when you get stronger! Take 1-2 rest days per week. Active recovery (easy walk, yoga, swimming) can help. Sleep 7-9 hours. Foam rolling, stretching, and massage aid recovery. DOMS (delayed onset muscle soreness) peaks 24-48 hours post-workout and is normal.",
  },
  // Speed & Performance
  {
    keywords: ['speed', 'faster', 'pace', 'quick', 'improve time', 'pr', 'personal best'],
    response: "To get faster, incorporate interval training (400m-1km repeats at 5K pace) and tempo runs (20-40 min at comfortably hard pace). Also, don't neglect your easy runs! Running slow helps build the aerobic base needed to run fast. Follow the 80/20 rule: 80% easy, 20% hard.",
  },
  {
    keywords: ['interval', 'speed work', 'track', 'fartlek', 'repeat'],
    response: "Intervals boost speed and VO2 max. Try: 8x400m at 5K pace with 90s rest, or 5x1km at 10K pace with 2min rest. Fartlek (Swedish for 'speed play') is unstructured: sprint to a tree, jog to recover, repeat. Always warm up 10-15 minutes before speed work!",
  },
  {
    keywords: ['tempo', 'threshold', 'lactate'],
    response: "Tempo runs are 'comfortably hard' - about 80-90% effort, or your 1-hour race pace. They improve your lactate threshold, letting you run faster before fatigue sets in. Start with 20 minutes, build to 40-60 minutes. Include 10-min warm-up and cool-down.",
  },
  // Training Plans & Structure
  {
    keywords: ['train', 'training plan', 'schedule', 'program', 'how many', 'how often', 'frequency'],
    response: "Beginners: 3-4 runs/week. Intermediate: 4-5 runs/week. Advanced: 5-6 runs/week. Include: easy runs, one long run, one speed/interval session, and one tempo run. Rest days are crucial! Increase weekly mileage by no more than 10% per week to avoid injury.",
  },
  {
    keywords: ['long run', 'sunday run', 'distance run', 'endurance'],
    response: "Long runs build endurance and mental toughness. Run them at an easy, conversational pace (60-75% effort). Start at 30-40% of weekly mileage and build gradually. For marathon training, peak long runs are 30-35km. Practice race-day nutrition and gear on long runs!",
  },
  {
    keywords: ['easy run', 'recovery run', 'slow', 'conversational pace'],
    response: "Easy runs should feel... easy! You should be able to hold a full conversation. This is 60-70% of max heart rate. Easy runs build aerobic base, aid recovery, and prevent injury. Most runners run their easy runs too fast - slow down!",
  },
  {
    keywords: ['cross train', 'cycling', 'swim', 'bike', 'strength', 'gym'],
    response: "Cross-training reduces injury risk and improves overall fitness. Great options: cycling, swimming, elliptical. Strength training 2x/week is crucial - focus on glutes, core, and single-leg exercises. Yoga improves flexibility and prevents injury.",
  },
  // Gear & Equipment
  {
    keywords: ['shoes', 'sneaker', 'footwear', 'running shoe'],
    response: "Rotate between 2 pairs of shoes to extend their life and reduce injury risk. Replace shoes every 500-800km. For race day, wear shoes you've trained in for at least a few long runs. Get fitted at a running store for proper shoe type (neutral, stability, motion control).",
  },
  {
    keywords: ['watch', 'gps', 'garmin', 'tracker', 'device'],
    response: "A GPS watch helps track pace, distance, and heart rate. Popular options: Garmin, Polar, Coros, Apple Watch. Don't become a slave to the watch - learn to run by feel too. Use it as a tool, not a dictator!",
  },
  {
    keywords: ['clothes', 'clothing', 'gear', 'what to wear', 'outfit'],
    response: "Wear moisture-wicking technical fabrics, not cotton. Dress as if it's 10°C warmer than actual temperature (you'll warm up!). Layer in cold weather. Bright/reflective gear for safety. Anti-chafe products for long runs. Test all race-day gear in training first!",
  },
  // Weather & Conditions
  {
    keywords: ['hot', 'heat', 'summer', 'warm weather'],
    response: "In heat, run early morning or evening. Slow your pace by 20-30 seconds per km. Hydrate more frequently. Wear light-colored, breathable clothing. Watch for heat exhaustion signs: dizziness, nausea, confusion. Acclimatization takes 10-14 days.",
  },
  {
    keywords: ['cold', 'winter', 'snow', 'ice', 'freezing'],
    response: "Layer up: base layer (moisture-wicking), mid layer (insulation), outer layer (wind/water protection). Cover extremities: gloves, hat, buff. You'll warm up after 10 minutes. Watch for ice - shorten stride and slow down. Treadmill is okay for safety!",
  },
  {
    keywords: ['rain', 'wet', 'raining'],
    response: "Embrace the rain! Wear a cap to keep rain out of eyes. Use anti-chafe products (wet skin chafes more). Waterproof jacket for heavy rain. Change out of wet clothes immediately after to avoid getting cold. Dry shoes with newspaper inside.",
  },
  // Race Day
  {
    keywords: ['race day', 'race morning', 'start line', 'marathon day', 'race strategy'],
    response: "Race day tips: Wake 3-4 hours before start. Eat familiar breakfast (300-400 calories). Arrive early. Warm up 10-15 minutes. Start conservatively - first half should feel easy. Stick to your race plan. Trust your training. Smile at the finish line! 🏃‍♂️",
  },
  {
    keywords: ['pacing', 'race pace', 'negative split', 'even pace'],
    response: "Negative splits (second half faster than first) are ideal but hard. Even pacing is more realistic. Start 5-10 seconds/km slower than goal pace. Use the first 5km to settle in. Save energy for the final push. Don't go out too fast - it's the #1 mistake!",
  },
  {
    keywords: ['wall', 'bonk', 'hitting the wall', 'km 30', 'mile 20'],
    response: "The 'wall' (around 30-35km in marathons) happens when glycogen depletes. Prevent it: proper training (long runs), carb-loading 2-3 days before, fueling during race (gels/drinks every 30-45 min). If you hit it: slow down, take a gel, walk if needed. Mental toughness gets you through!",
  },
  // Mental & Motivation
  {
    keywords: ['motivat', 'lazy', 'don\'t want', 'tired', 'no energy', 'skip'],
    response: "Motivation comes and goes - discipline is what matters. Tips: Set specific goals, find a running buddy, join a club, sign up for a race, track progress, reward yourself. Remember: you never regret a run, only the ones you skip. Just start - often the hardest part is getting out the door!",
  },
  {
    keywords: ['mental', 'mind', 'psychology', 'focus', 'concentration'],
    response: "Mental training is crucial! Techniques: visualization (imagine race success), positive self-talk ('I am strong'), breaking runs into chunks, mantras ('one step at a time'). Practice mental strategies in training. Embrace discomfort - it's temporary. Your mind will quit before your body.",
  },
  // Beginner Questions
  {
    keywords: ['beginner', 'start running', 'new runner', 'never run', 'first time'],
    response: "Welcome to running! Start with walk/run intervals (Couch to 5K is great). Run 3x/week with rest days between. Invest in proper shoes. Start slow - you should be able to talk. Build gradually - consistency over intensity. Join a beginner group for support. You've got this!",
  },
  {
    keywords: ['breathe', 'breathing', 'breath', 'out of breath'],
    response: "Breathe naturally - don't overthink it! Most runners use a 2:2 or 3:3 pattern (inhale for 2-3 steps, exhale for 2-3 steps). Breathe through both nose and mouth. If you're gasping, slow down. Deep belly breathing is more efficient than shallow chest breathing.",
  },
  {
    keywords: ['cadence', 'steps per minute', 'spm', 'stride'],
    response: "Optimal cadence is 170-180 steps per minute. Higher cadence reduces injury risk and improves efficiency. Count steps for 30 seconds and multiply by 2. To increase cadence: shorten stride, use a metronome app, run to music with matching BPM.",
  },
  // Distance-specific
  {
    keywords: ['5k', '5 km', 'parkrun'],
    response: "5K is a great distance! Race pace is hard but sustainable - about 90-95% effort. Training: include tempo runs and 400m-1km intervals. Warm up thoroughly (15 min). Start controlled, push the middle, sprint the last 400m. Sub-20 and sub-25 are common goals!",
  },
  {
    keywords: ['10k', '10 km'],
    response: "10K is the sweet spot of speed and endurance! Race pace is 'comfortably hard' - about 85-90% effort. Training: long runs up to 15km, tempo runs, and intervals. It's long enough to require pacing strategy but short enough to push hard. Great stepping stone to half marathon!",
  },
  {
    keywords: ['half marathon', 'half', '21k', '21.1'],
    response: "Half marathon is 21.1km of awesome! Build to 16-18km long runs. Practice race pace in training. Fuel with gels from km 10. It's a true test of endurance and pacing. Many runners find it the perfect distance - challenging but not as demanding as a full marathon.",
  },
  {
    keywords: ['marathon', 'full marathon', '42k', '42.2', 'full'],
    response: "The marathon is 42.2km of glory and pain! Requires 16-20 weeks of training. Peak long runs: 30-35km. Practice nutrition, pacing, and mental strategies. Respect the distance. The race truly starts at km 30. It will test you, but crossing that finish line is unforgettable! 🏅",
  },
  {
    keywords: ['ultra', 'ultramarathon', '50k', '100k', '100 mile'],
    response: "Ultras (>42.2km) are a different beast! Focus on time on feet, not pace. Back-to-back long runs help. Nutrition and mental toughness are crucial. Walk the uphills. Aid stations are your friend. Start conservatively. It's about finishing, not time. Embrace the journey!",
  },
  // General encouragement
  {
    keywords: ['thank', 'thanks', 'appreciate'],
    response: "You're welcome! I'm here to help you become the best runner you can be. Keep up the great work! 🏃‍♂️💪",
  },
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
    response: "Hello! Great to see you! Ready to talk about running? Whether it's training tips, nutrition advice, or race strategy, I'm here to help. What's on your mind?",
  },
];

const DAILY_TIPS = [
  "Consistency beats intensity. It's better to run 20 mins every day than 2 hours once a week.",
  "Hydrate! Aim to drink water throughout the day, not just right before your run.",
  "Sleep is your best recovery tool. Aim for 7-9 hours tonight.",
  "Don't skip the warm-up. 5 minutes of dynamic stretching can prevent injury.",
  "Listen to your body. If you're exhausted, an easy run or rest day is better than pushing through.",
];

class AICoachServiceClass {
  private lastAdviceTime: number = 0;
  private adviceQueue: CoachingAdvice[] = [];
  private isSpeaking: boolean = false;
  private adviceCooldown: number = 30000; // 30 seconds between advice

  // Chat Methods
  getInitialMessages(): ChatMessage[] {
    return [INITIAL_GREETING];
  }

  async sendMessage(userText: string): Promise<ChatMessage> {
    // Simulate network delay for realistic feel
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerText = userText.toLowerCase();
    const words = lowerText.split(/\s+/);

    // Enhanced keyword matching with scoring
    const matches = KNOWLEDGE_BASE.map(entry => {
      let score = 0;
      let matchedKeywords: string[] = [];

      entry.keywords.forEach(keyword => {
        // Exact phrase match gets highest score
        if (lowerText.includes(keyword)) {
          score += 10;
          matchedKeywords.push(keyword);
        }

        // Partial word matches get lower score
        words.forEach(word => {
          if (word.includes(keyword) || keyword.includes(word)) {
            score += 3;
          }
        });
      });

      return { entry, score, matchedKeywords };
    }).filter(m => m.score > 0)
      .sort((a, b) => b.score - a.score);

    let responseText: string;

    if (matches.length > 0 && matches[0].score >= 10) {
      // Strong match found
      responseText = matches[0].entry.response;
    } else if (matches.length > 0 && matches[0].score >= 5) {
      // Moderate match - provide response with context
      responseText = matches[0].entry.response;
    } else {
      // No strong match - use intelligent fallback based on message analysis
      responseText = this.generateIntelligentFallback(lowerText, words);
    }

    return {
      id: Date.now().toString(),
      text: responseText,
      sender: 'ai',
      timestamp: Date.now(),
    };
  }

  private generateIntelligentFallback(lowerText: string, words: string[]): string {
    // Detect question type
    const isQuestion = lowerText.includes('?') ||
      words.some(w => ['how', 'what', 'when', 'where', 'why', 'who', 'can', 'should', 'would', 'could'].includes(w));

    const isGreeting = words.some(w => ['hello', 'hi', 'hey', 'good', 'morning', 'evening', 'afternoon'].includes(w));

    const isThanks = words.some(w => ['thank', 'thanks', 'appreciate', 'grateful'].includes(w));

    // Check for specific running-related terms that might not have matched
    const runningTerms = ['run', 'jog', 'sprint', 'race', 'marathon', 'training', 'workout', 'exercise', 'fitness'];
    const hasRunningContext = words.some(w => runningTerms.some(term => w.includes(term)));

    // Check for numbers (might be asking about distances, times, etc.)
    const hasNumbers = /\d+/.test(lowerText);

    // NEW: Detect if user is sharing their running stats/achievements
    const isSharing = words.some(w => ['ran', 'run', 'did', 'completed', 'finished', 'today', 'yesterday', 'last', 'this'].includes(w));

    // Extract distance and time if present
    const distanceMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(km|k|kilometer|mile|m)/i);
    const timeMatch = lowerText.match(/(\d+)\s*(min|minute|hour|hr)/i);

    // If user is sharing their run stats, provide personalized feedback
    if (isSharing && hasRunningContext && (distanceMatch || timeMatch)) {
      let response = "That's awesome! ";

      if (distanceMatch && timeMatch) {
        const distance = parseFloat(distanceMatch[1]);
        const time = parseInt(timeMatch[1]);
        const unit = distanceMatch[2].toLowerCase();

        // Calculate pace
        let paceMinPerKm: number;
        if (unit.includes('km') || unit === 'k') {
          paceMinPerKm = time / distance;
        } else {
          // Convert miles to km
          paceMinPerKm = time / (distance * 1.609);
        }

        const paceMin = Math.floor(paceMinPerKm);
        const paceSec = Math.round((paceMinPerKm - paceMin) * 60);

        response += `You ran ${distance}${unit} in ${time} minutes - that's a ${paceMin}:${paceSec.toString().padStart(2, '0')}/km pace! `;

        // Provide contextual feedback based on pace
        if (paceMinPerKm < 4) {
          response += "That's an elite-level pace! 🔥 You're flying! Keep up that speed work and make sure you're balancing with easy recovery runs.";
        } else if (paceMinPerKm < 5) {
          response += "Excellent pace! 💪 That's solid running. You're in great shape. Consider adding some tempo runs to push even faster.";
        } else if (paceMinPerKm < 6) {
          response += "Great job! 👏 That's a strong, sustainable pace. Perfect for building endurance. Keep consistent and you'll see improvements!";
        } else if (paceMinPerKm < 7) {
          response += "Nice work! 🏃‍♂️ That's a good conversational pace - perfect for building your aerobic base. Consistency is key!";
        } else {
          response += "Well done on getting out there! 🌟 Every run counts. Focus on consistency and gradually you'll get faster. Keep it up!";
        }

        return response;
      } else if (distanceMatch) {
        const distance = parseFloat(distanceMatch[1]);
        const unit = distanceMatch[2].toLowerCase();

        response += `${distance}${unit} - great distance! `;

        if (distance >= 21) {
          response += "That's half marathon distance or more! 🏅 Incredible endurance. Make sure you're fueling properly and recovering well.";
        } else if (distance >= 10) {
          response += "Double digits! 💪 That's solid mileage. Great for building endurance. Don't forget to hydrate and refuel after!";
        } else if (distance >= 5) {
          response += "5K+ is a fantastic distance! 🎯 Perfect for building fitness. Keep up the consistency!";
        } else {
          response += "Every kilometer counts! 🌟 Short runs are great for recovery and maintaining consistency. Keep it up!";
        }

        return response;
      } else if (timeMatch) {
        const time = parseInt(timeMatch[1]);

        response += `${time} minutes of running - excellent! `;

        if (time >= 60) {
          response += "An hour or more! 🏃‍♂️ That's serious dedication. Make sure you're staying hydrated and fueling during longer runs.";
        } else if (time >= 30) {
          response += "30+ minutes is the sweet spot for building aerobic fitness! 💪 Keep this up consistently and you'll see great results.";
        } else {
          response += "Short runs are perfect for recovery and maintaining your routine! 🌟 Consistency beats intensity!";
        }

        return response;
      }
    }

    // If user is sharing but we couldn't extract specifics
    if (isSharing && hasRunningContext) {
      return "That's great that you got out there and ran! 🏃‍♂️ I'd love to give you more specific feedback - could you tell me the distance and time? For example: 'I ran 6km in 30 minutes' or 'I did a 5K today'. Then I can analyze your pace and give you personalized advice!";
    }

    // Generate contextual response
    if (isGreeting) {
      return "Hello! Great to see you! 👋 I'm your AI running coach. I can help with training plans, nutrition, injury prevention, race strategies, and much more. What would you like to know?";
    }

    if (isThanks) {
      return "You're very welcome! I'm always here to help you reach your running goals. Keep up the amazing work! 🏃‍♂️💪";
    }

    if (isQuestion && hasRunningContext) {
      return "That's an interesting running question! While I don't have a specific answer for that exact scenario, here's what I can tell you: Focus on consistency, listen to your body, and gradually build up. Could you rephrase or ask about a specific aspect? I'm great with: training plans, nutrition, injuries, pacing, gear, race prep, and mental strategies.";
    }

    if (isQuestion && hasNumbers) {
      return "I see you're asking about specific numbers or metrics! For personalized advice on distances, times, or paces, I'd recommend: 1) Start with your current fitness level, 2) Set realistic goals, 3) Follow a structured plan. What specific aspect would you like help with? (e.g., 'How do I train for a 10K?' or 'What pace should I run?')";
    }

    if (isQuestion) {
      return "Great question! I specialize in running and training topics. I can help you with:\n\n• Training plans & schedules\n• Nutrition & hydration\n• Injury prevention & recovery\n• Race preparation & strategy\n• Speed work & performance\n• Gear & equipment\n• Mental toughness\n\nWhat running topic interests you most?";
    }

    if (hasRunningContext) {
      return "I understand you're talking about running! I'd love to help, but I need a bit more detail. Could you ask a specific question? For example: 'How often should I run?' or 'What should I eat before a race?' I'm here to provide expert running advice!";
    }

    // General fallback for non-running topics
    if (words.some(w => ['weather', 'time', 'date', 'news', 'music', 'movie', 'book'].includes(w))) {
      return "I appreciate the question, but I'm specifically designed to help with running and training! 🏃‍♂️ While I can't help with that topic, I'm an expert on everything running-related. Want to ask me about training, nutrition, races, or performance tips?";
    }

    // Ultimate fallback
    return "I want to help you, but I'm not quite sure what you're asking about! I'm your AI running coach, so I'm best at answering questions about:\n\n✓ Training & workouts\n✓ Nutrition & fueling\n✓ Injury prevention\n✓ Race preparation\n✓ Running gear\n✓ Performance tips\n\nCould you ask a running-related question? I'm here to help you become a better runner!";
  }

  getDailyTip(): string {
    const index = new Date().getDate() % DAILY_TIPS.length;
    return DAILY_TIPS[index];
  }

  analyzeMetrics(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    const now = Date.now();

    // Don't give advice too frequently
    if (now - this.lastAdviceTime < this.adviceCooldown) {
      return null;
    }

    // Check pace
    const paceAdvice = this.checkPace(metrics, context);
    if (paceAdvice) return paceAdvice;

    // Check heart rate
    const hrAdvice = this.checkHeartRate(metrics, context);
    if (hrAdvice) return hrAdvice;

    // Check form (cadence)
    const formAdvice = this.checkForm(metrics, context);
    if (formAdvice) return formAdvice;

    // Check terrain
    const terrainAdvice = this.checkTerrain(metrics, context);
    if (terrainAdvice) return terrainAdvice;

    // Motivational messages
    const motivationAdvice = this.getMotivation(metrics, context);
    if (motivationAdvice) return motivationAdvice;

    return null;
  }

  private checkPace(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    if (!context.targetPace || metrics.pace === 0) return null;

    const paceDiff = metrics.pace - context.targetPace;
    const paceVariance = Math.abs(paceDiff) / context.targetPace;

    // Too fast
    if (paceDiff < -0.2 && paceVariance > 0.1) {
      const slowdownPercent = Math.round(paceVariance * 100);
      return {
        type: 'pace',
        message: `Slow down ${slowdownPercent}% to maintain your target pace`,
        urgency: 'medium',
        action: 'reduce_pace',
        shouldSpeak: true,
      };
    }

    // Too slow
    if (paceDiff > 0.3 && paceVariance > 0.15) {
      const speedupPercent = Math.round(paceVariance * 100);
      return {
        type: 'pace',
        message: `Pick up the pace by ${speedupPercent}% to hit your target`,
        urgency: 'low',
        action: 'increase_pace',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private checkHeartRate(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    if (!context.targetHRZone || metrics.heartRate === 0) return null;

    const { min, max } = context.targetHRZone;

    // HR too high
    if (metrics.heartRate > max + 10) {
      return {
        type: 'heartrate',
        message: `Slow down to keep your heart rate in zone. Currently at ${metrics.heartRate} BPM`,
        urgency: 'high',
        action: 'reduce_intensity',
        shouldSpeak: true,
      };
    }

    // HR too low (for tempo/intervals)
    if (context.workoutType === 'tempo' && metrics.heartRate < min - 5) {
      return {
        type: 'heartrate',
        message: `Increase your effort. Heart rate is below target zone`,
        urgency: 'medium',
        action: 'increase_intensity',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private checkForm(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    if (metrics.cadence === 0) return null;

    // Low cadence (overstriding risk)
    if (metrics.cadence < 160) {
      const increase = 170 - metrics.cadence;
      return {
        type: 'form',
        message: `Your cadence is low at ${metrics.cadence} steps per minute. Try to increase by ${increase} steps to reduce injury risk`,
        urgency: 'medium',
        action: 'increase_cadence',
        shouldSpeak: true,
      };
    }

    // Check stride length (if too long, might be overstriding)
    if (metrics.stride > 1.4) {
      return {
        type: 'form',
        message: `You may be overstriding. Shorten your step length slightly`,
        urgency: 'low',
        action: 'shorten_stride',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private checkTerrain(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    // Check if there's significant elevation ahead
    if (metrics.elevationAhead > metrics.elevation + 20) {
      const elevationGain = Math.round(metrics.elevationAhead - metrics.elevation);
      return {
        type: 'terrain',
        message: `Hill ahead with ${elevationGain} meters elevation gain. Save energy now`,
        urgency: 'medium',
        action: 'prepare_for_hill',
        shouldSpeak: true,
      };
    }

    // Downhill ahead
    if (metrics.elevationAhead < metrics.elevation - 20) {
      return {
        type: 'terrain',
        message: `Downhill coming up. Let gravity help but maintain control`,
        urgency: 'low',
        action: 'prepare_for_downhill',
        shouldSpeak: true,
      };
    }

    return null;
  }

  private getMotivation(metrics: RunMetrics, context: CoachingContext): CoachingAdvice | null {
    // Motivational messages based on distance milestones
    const distanceKm = metrics.distance / 1000;

    if (distanceKm > 0 && distanceKm % 5 < 0.1) { // Every 5km
      const messages = [
        `Great job! You've completed ${Math.floor(distanceKm)} kilometers`,
        `${Math.floor(distanceKm)} kilometers down! Keep up the strong pace`,
        `Excellent work! ${Math.floor(distanceKm)} kilometers completed`,
      ];

      return {
        type: 'motivation',
        message: messages[Math.floor(Math.random() * messages.length)],
        urgency: 'low',
        action: 'celebrate',
        shouldSpeak: true,
      };
    }

    return null;
  }

  async speakAdvice(advice: CoachingAdvice) {
    if (!advice.shouldSpeak || this.isSpeaking) return;

    this.isSpeaking = true;
    this.lastAdviceTime = Date.now();

    try {
      await Speech.speak(advice.message, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
        onDone: () => {
          this.isSpeaking = false;
        },
        onError: () => {
          this.isSpeaking = false;
        },
      });
    } catch (error) {
      console.error('Speech error:', error);
      this.isSpeaking = false;
    }
  }

  setAdviceCooldown(seconds: number) {
    this.adviceCooldown = seconds * 1000;
  }

  reset() {
    this.lastAdviceTime = 0;
    this.adviceQueue = [];
    this.isSpeaking = false;
  }
}

export const AICoachService = new AICoachServiceClass();
