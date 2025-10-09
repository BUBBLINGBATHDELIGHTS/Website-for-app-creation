'use client';

import { useEffect, useMemo, useState } from 'react';

const events = [
  { location: 'Seattle, USA', action: 'Customised Dreamy bath bomb with aurora oils' },
  { location: 'Lisbon, PT', action: 'Redeemed Ritual Points for Lumen tier bonus set' },
  { location: 'Seoul, KR', action: 'Shared Joy Index story featuring eucalyptus shimmer' },
  { location: 'Melbourne, AU', action: 'Added Grounded ritual to persistent cart' },
];

export function SocialProofFeed() {
  const [index, setIndex] = useState(0);
  const shuffled = useMemo(() => events, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % shuffled.length);
    }, 5000);
    return () => window.clearInterval(id);
  }, [shuffled.length]);

  const event = shuffled[index];

  return (
    <div className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-inner">
      <p className="text-xs uppercase tracking-wide text-purple-400">Live community pulse</p>
      <p className="mt-2 text-sm text-purple-700">
        Just now in <span className="font-semibold text-purple-900">{event.location}</span>: {event.action}
      </p>
    </div>
  );
}
