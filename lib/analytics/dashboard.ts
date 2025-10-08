import { createClient } from '@/lib/supabase/server-client';

export type SparkDatum = { label: string; value: number };
export type SecondaryKpi = {
  id: string;
  creativeLabel: string;
  metricLabel: string;
  value: string;
  delta: string;
  sparkline: SparkDatum[];
};

export type InventoryInsight = {
  sku: string;
  coveragePercent: number;
  status: 'healthy' | 'warning' | 'critical';
};

export type AlertTier = {
  id: string;
  tier: 'critical' | 'warning' | 'info';
  message: string;
  recommendedAction: string;
};

export type FunnelMetric = {
  stage: string;
  conversion: number;
};

export type DashboardPayload = {
  primaryKpi: {
    creativeLabel: string;
    metricLabel: string;
    value: string;
    narrative: string;
  };
  secondaryKpis: SecondaryKpi[];
  inventoryInsights: InventoryInsight[];
  alertTiers: AlertTier[];
  funnel: FunnelMetric[];
  auditLog: Array<{ actor: string; action: string; timestamp: string }>;
};

export async function getDashboardPayload(): Promise<DashboardPayload> {
  try {
    const client = createClient();
    await client.rpc('noop');
  } catch (error) {
    console.debug('Supabase dashboard view unavailable in local prototype', error);
  }

  return {
    primaryKpi: {
      creativeLabel: 'Resonance',
      metricLabel: 'Customer Joy Index',
      value: '94.6',
      narrative: 'Emotionally engaged customers deliver +18% repeat revenue this quarter.',
    },
    secondaryKpis: [
      {
        id: 'revenue',
        creativeLabel: 'Flow',
        metricLabel: 'Revenue Run Rate',
        value: '$482k',
        delta: '+12.4% vs target',
        sparkline: [
          { label: 'W1', value: 320 },
          { label: 'W2', value: 360 },
          { label: 'W3', value: 410 },
          { label: 'W4', value: 482 },
        ],
      },
      {
        id: 'conversion',
        creativeLabel: 'Alchemy',
        metricLabel: 'Conversion Rate',
        value: '4.8%',
        delta: '+0.9 pts',
        sparkline: [
          { label: 'Jan', value: 3.1 },
          { label: 'Feb', value: 3.8 },
          { label: 'Mar', value: 4.1 },
          { label: 'Apr', value: 4.8 },
        ],
      },
      {
        id: 'aov',
        creativeLabel: 'Abundance',
        metricLabel: 'Average Order Value',
        value: '$86',
        delta: '+$7 uplift',
        sparkline: [
          { label: 'Jan', value: 71 },
          { label: 'Feb', value: 78 },
          { label: 'Mar', value: 82 },
          { label: 'Apr', value: 86 },
        ],
      },
      {
        id: 'churn',
        creativeLabel: 'Retention',
        metricLabel: '30-day Churn',
        value: '3.4%',
        delta: '-1.2 pts',
        sparkline: [
          { label: 'Jan', value: 5.1 },
          { label: 'Feb', value: 4.6 },
          { label: 'Mar', value: 3.9 },
          { label: 'Apr', value: 3.4 },
        ],
      },
    ],
    inventoryInsights: [
      { sku: 'Jasmine Nebula', coveragePercent: 26, status: 'critical' },
      { sku: 'Aurora Ritual Kit', coveragePercent: 58, status: 'warning' },
      { sku: 'Lunar Foam Cleanser', coveragePercent: 92, status: 'healthy' },
    ],
    alertTiers: [
      {
        id: 'inventory-critical',
        tier: 'critical',
        message: 'Inventory depth for Jasmine Nebula below 30% threshold.',
        recommendedAction: 'Trigger auto-restock workflow and alert procurement lead.',
      },
      {
        id: 'sentiment-warning',
        tier: 'warning',
        message: 'Customer Joy Index dipped among first-time shoppers yesterday.',
        recommendedAction: 'Deploy onboarding ritual tips via email journey.',
      },
      {
        id: 'ai-info',
        tier: 'info',
        message: 'AI concierge generated 48 personalised rituals overnight.',
        recommendedAction: 'Review standout blends for merchandising spotlight.',
      },
    ],
    funnel: [
      { stage: 'Impressions → View', conversion: 68 },
      { stage: 'View → Add to Ritual Cart', conversion: 32 },
      { stage: 'Ritual Cart → Checkout', conversion: 21 },
      { stage: 'Checkout → Purchase', conversion: 16 },
    ],
    auditLog: [
      {
        actor: 'growth-agent',
        action: 'Triggered revalidation for /shop/products to sync sentiment-driven recommendations.',
        timestamp: '2024-04-12T09:12:00Z',
      },
      {
        actor: 'ops-agent',
        action: 'Queued critical restock alert for Jasmine Nebula into Redis priority stream.',
        timestamp: '2024-04-12T08:44:00Z',
      },
      {
        actor: 'cx-agent',
        action: 'Logged Joy Index uplift after loyalty surprise & delight campaign.',
        timestamp: '2024-04-11T22:08:00Z',
      },
    ],
  };
}
