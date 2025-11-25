interface StorySegment {
  text: string;
  trigger: 'distance' | 'time' | 'pace';
  value: number;
}

const ZOMBIE_STORY: StorySegment[] = [
  { text: "Runners detected. The quarantine zone is breached. Move out, now!", trigger: 'time', value: 0 },
  { text: "They smell your fear. Pick up the pace!", trigger: 'distance', value: 500 },
  { text: "You're slowing down. Can you hear them behind you?", trigger: 'pace', value: 8 }, // 8 min/km
  { text: "Great work, you've put some distance between us and the horde.", trigger: 'distance', value: 1000 },
  { text: "Warning! Large group ahead. Sprint!", trigger: 'distance', value: 2000 },
];

export const getStorySegment = (
  distance: number,
  duration: number,
  pace: number,
  lastTriggeredIndex: number
): { text: string; index: number } | null => {
  // Simple logic: check next segments
  for (let i = lastTriggeredIndex + 1; i < ZOMBIE_STORY.length; i++) {
    const segment = ZOMBIE_STORY[i];
    if (segment.trigger === 'distance' && distance >= segment.value) {
      return { text: segment.text, index: i };
    }
    if (segment.trigger === 'time' && duration >= segment.value) {
      return { text: segment.text, index: i };
    }
    if (segment.trigger === 'pace' && pace > segment.value) {
       // Only trigger pace warnings if we haven't triggered them recently? 
       // For simplicity, let's just return it once.
       return { text: segment.text, index: i };
    }
  }
  return null;
};
