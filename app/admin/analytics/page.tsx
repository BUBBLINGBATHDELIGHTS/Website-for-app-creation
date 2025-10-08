import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Metadata } from 'next';
import { getDashboardPayload } from '@/lib/analytics/dashboard';

export const metadata: Metadata = {
  title: 'Admin Analytics · Bubbling Bath Delights',
};

function Sparkline({ points }: { points: { label: string; value: number }[] }) {
  const max = Math.max(...points.map((point) => point.value));
  const min = Math.min(...points.map((point) => point.value));
  const range = max - min || 1;
  const path = points
    .map((point, index) => {
      const x = (index / (points.length - 1 || 1)) * 100;
      const y = 100 - ((point.value - min) / range) * 100;
      return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
    })
    .join(' ');

  return (
    <svg className="h-16 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="presentation">
      <path d={path} className="stroke-eucalyptus-400" fill="none" strokeWidth={4} strokeLinecap="round" />
    </svg>
  );
}

export default async function AdminAnalyticsPage() {
  const dashboard = await getDashboardPayload();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-purple-900">Holistic insights</h1>
        <p className="text-sm text-purple-700">
          KPI hierarchy aligns with Supabase views for revenue, conversion, AOV, churn, and retention. Customer sentiment feeds
          the Customer Joy Index to guide emotional commerce decisions.
        </p>
      </header>

      <Card className="border-eucalyptus-200 bg-white/80">
        <CardHeader>
          <CardTitle className="text-purple-900">
            <span className="text-sm uppercase tracking-wide text-eucalyptus-500">{dashboard.primaryKpi.creativeLabel}</span>
            <br />
            {dashboard.primaryKpi.metricLabel}
          </CardTitle>
          <CardDescription>{dashboard.primaryKpi.narrative}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-display text-6xl text-purple-900">{dashboard.primaryKpi.value}</p>
        </CardContent>
      </Card>

      <section className="grid gap-6 md:grid-cols-2">
        {dashboard.secondaryKpis.map((metric) => (
          <Card key={metric.id} className="border-purple-100">
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle className="text-purple-900">
                  <span className="text-xs uppercase tracking-wide text-purple-400">{metric.creativeLabel}</span>
                  <br />
                  {metric.metricLabel}
                </CardTitle>
                <CardDescription>{metric.delta}</CardDescription>
              </div>
              <div className="min-w-[96px] text-right font-display text-3xl text-purple-900">{metric.value}</div>
            </CardHeader>
            <CardContent>
              <Sparkline points={metric.sparkline} />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900">Conversion funnel</CardTitle>
            <CardDescription>Edge orchestrator syncs Supabase + GA4 for precision marketing.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-purple-700">
              {dashboard.funnel.map((stage) => (
                <li key={stage.stage} className="flex items-center justify-between rounded-2xl bg-purple-50/70 px-4 py-3">
                  <span>{stage.stage}</span>
                  <span className="font-semibold text-purple-900">{stage.conversion}%</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900">AI alert tiering</CardTitle>
            <CardDescription>Redis priority queues highlight urgency with colour-coded badges.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-purple-700">
              {dashboard.alertTiers.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-2xl border border-purple-100 bg-white/80 px-4 py-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        alert.tier === 'critical'
                          ? 'destructive'
                          : alert.tier === 'warning'
                          ? 'warning'
                          : 'secondary'
                      }
                    >
                      {alert.tier.toUpperCase()}
                    </Badge>
                    <span className="text-xs uppercase tracking-wide text-purple-400">Redis queue</span>
                  </div>
                  <p className="mt-2 font-semibold text-purple-900">{alert.message}</p>
                  <p className="text-xs text-purple-600">{alert.recommendedAction}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900">Inventory depth tracker</CardTitle>
            <CardDescription>Auto-restock triggers fire when SKU coverage falls below 30%.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-purple-700">
              {dashboard.inventoryInsights.map((item) => (
                <li
                  key={item.sku}
                  className="flex items-center justify-between rounded-2xl bg-purple-50/70 px-4 py-3"
                >
                  <span>{item.sku}</span>
                  <span
                    className={`font-semibold ${
                      item.status === 'critical'
                        ? 'text-rose-500'
                        : item.status === 'warning'
                        ? 'text-amber-500'
                        : 'text-emerald-600'
                    }`}
                  >
                    {item.coveragePercent}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-purple-900">Agent audit log</CardTitle>
            <CardDescription>Supabase table `agent_actions` ensures accountability.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-purple-700">
              {dashboard.auditLog.map((entry) => (
                <li key={entry.timestamp} className="rounded-2xl bg-white/80 p-3 shadow-sm">
                  <p className="font-semibold text-purple-900">{entry.actor}</p>
                  <p>{entry.action}</p>
                  <p className="text-xs text-purple-500">{entry.timestamp}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
