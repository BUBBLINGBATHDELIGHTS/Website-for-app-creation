import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Analytics · Bubbling Bath Delights',
};

const metrics = [
  {
    title: 'Emotion resonance',
    value: '92%',
    change: '+4.6% vs last week',
  },
  {
    title: 'Seasonal collection readiness',
    value: '87%',
    change: 'AI agents prepped 26 items',
  },
  {
    title: 'Wishlist to checkout velocity',
    value: '3.1 days',
    change: 'Optimistic UI lifted conversions',
  },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-[#2F1F52]">Holistic insights</h1>
        <p className="text-sm text-[#4F3C75]">
          Powered by Supabase edge functions, OpenTelemetry, and seasonal AI observers.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader>
              <CardTitle>{metric.title}</CardTitle>
              <CardDescription>{metric.change}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl text-[#2F1F52]">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Autonomous agent signals</CardTitle>
              <CardDescription>Generated from on-demand ISR and Redis-backed event storage.</CardDescription>
            </div>
            <Badge variant="success">Live</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-[#4F3C75]">
            <li>• Inventory sentinel flagged low-stock Jasmine Nebula (18 remaining).</li>
            <li>• Sentiment analysis reveals rising excitement for lunar rituals (↑ 18%).</li>
            <li>• Performance agent recommends prefetching vector bundles for new bundle builder.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
