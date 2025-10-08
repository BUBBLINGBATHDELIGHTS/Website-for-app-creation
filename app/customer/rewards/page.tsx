import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Ritual Rewards · Bubbling Bath Delights',
};

const tiers = [
  { name: 'Bloom', points: 0, perks: ['Early ritual drops', 'Seasonal playlists'] },
  { name: 'Lumen', points: 1200, perks: ['Exclusive blends', 'Mood AI concierge', 'Quarterly spa credits'] },
  { name: 'Aurora', points: 2500, perks: ['Invite-only rituals', '1:1 scent sommelier', 'Lifetime refills on hero product'] },
];

export default function RewardsPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white/80 p-6 shadow-lg">
        <h2 className="font-display text-2xl text-purple-900">Ritual Points ecosystem</h2>
        <p className="text-sm text-purple-700">
          Supabase functions mint and burn points as shoppers complete streaks. TODO: connect to `ritual_points_ledger` view.
        </p>
      </section>
      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <Card key={tier.name} className="border-purple-100">
            <CardHeader>
              <Badge>{tier.name} tier</Badge>
              <CardTitle className="mt-2 text-purple-900">Unlock at {tier.points.toLocaleString()} pts</CardTitle>
              <CardDescription>Amplify your Customer Joy Index with rewards that feel bespoke.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-purple-700">
                {tier.perks.map((perk) => (
                  <li key={perk}>• {perk}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
