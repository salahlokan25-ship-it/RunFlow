export interface ElevationData {
  gain: number;
  loss: number;
}

/**
 * Calculate elevation gain and loss from GPS points
 * Uses a threshold to filter out GPS noise
 */
export const calculateElevation = (
  points: Array<{ altitude?: number | null }>,
  threshold: number = 3 // minimum meters to count as elevation change
): ElevationData => {
  let gain = 0;
  let loss = 0;

  for (let i = 1; i < points.length; i++) {
    const prevAlt = points[i - 1].altitude;
    const currAlt = points[i].altitude;

    if (prevAlt == null || currAlt == null) continue;

    const diff = currAlt - prevAlt;

    // Only count changes above threshold to reduce GPS noise
    if (Math.abs(diff) >= threshold) {
      if (diff > 0) {
        gain += diff;
      } else {
        loss += Math.abs(diff);
      }
    }
  }

  return { gain, loss };
};
