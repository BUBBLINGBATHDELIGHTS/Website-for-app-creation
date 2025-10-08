export type RitualEvent = 'daily_ritual' | 'story_share' | 'purchase';

const pointValues: Record<RitualEvent, number> = {
  daily_ritual: 25,
  story_share: 120,
  purchase: 80,
};

export function calculatePoints(events: RitualEvent[]) {
  return events.reduce((total, event) => total + (pointValues[event] ?? 0), 0);
}

export function estimateNextTier(currentPoints: number, targetTierPoints: number) {
  const remaining = Math.max(targetTierPoints - currentPoints, 0);
  const daily = pointValues.daily_ritual + pointValues.purchase;
  return {
    remaining,
    estimatedDays: remaining === 0 ? 0 : Math.ceil(remaining / daily),
  };
}
