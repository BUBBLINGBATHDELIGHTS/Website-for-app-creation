import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Community Stories · Bubbling Bath Delights',
};

const stories = [
  {
    author: 'Aria in Portland',
    snippet: 'Layered the Dreamy blend with petal confetti to celebrate my promotion — Joy Index spiked to 98!',
  },
  {
    author: 'Noah in Montreal',
    snippet: 'Added cedar grounding to unwind after long rehearsals. My ritual streak is now 14 days strong.',
  },
  {
    author: 'Jules in Austin',
    snippet: 'Shared a Lunar Ritual in the feed and unlocked 120 Ritual Points from community kudos.',
  },
];

export default function StoriesPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white/80 p-6 shadow-lg">
        <h2 className="font-display text-2xl text-purple-900">My Ritual Today</h2>
        <p className="text-sm text-purple-700">
          Supabase Realtime will broadcast new stories as they are approved by AI moderation. TODO: connect to `community_stories_stream`.
        </p>
      </section>
      <div className="grid gap-6 md:grid-cols-3">
        {stories.map((story) => (
          <Card key={story.author} className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-purple-900">{story.author}</CardTitle>
              <CardDescription>Storytelling feed highlight</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-700">{story.snippet}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
