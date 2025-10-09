import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Customer Dashboard · Bubbling Bath Delights',
};

const journeyMetrics = [
  {
    label: 'Customer Joy Index',
    creativeLabel: 'Resonance',
    value: '94',
    descriptor: 'Synthesised from sentiment journaling and repeat purchase cadence.',
  },
  {
    label: 'Ritual streak',
    creativeLabel: 'Momentum',
    value: '7 days',
    descriptor: 'Daily rituals logged across ambient, bath, and skincare formats.',
  },
  {
    label: 'Ritual points',
    creativeLabel: 'Glow',
    value: '1,240',
    descriptor: 'Redeemable for exclusive scents and AI-personalised blends.',
  },
];

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white/80 p-6 shadow-lg">
        <h2 className="font-display text-2xl text-purple-900">Emotional commerce snapshot</h2>
        <p className="text-sm text-purple-700">
          This prototype surfaces qualitative + quantitative sentiment. TODO: replace with Supabase view `customer_joy_index_view`.
        </p>
      </section>
      <div className="grid gap-6 md:grid-cols-3">
        {journeyMetrics.map((metric) => (
          <Card key={metric.label} className="border-purple-100">
            <CardHeader>
              <CardTitle className="text-purple-900">
                <span className="text-sm uppercase tracking-wide text-purple-400">{metric.creativeLabel}</span>
                <br />
                {metric.label}
              </CardTitle>
              <CardDescription>{metric.descriptor}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-display text-4xl text-purple-900">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
