import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { listCustomers } from '@/lib/data/customers';
import { getSettings } from '@/lib/data/settings';
import { updateCustomerPointsAction } from './actions';

export const revalidate = 180;

export default async function AdminCustomersPage() {
  const [customers, settings] = await Promise.all([listCustomers(), getSettings()]);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-[#2F1F52]">Customer insights</h1>
        <p className="text-sm text-[#4F3C75]">Reward loyalty, review preferences, and celebrate top advocates.</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2">
        {customers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader>
              <CardTitle>{customer.name}</CardTitle>
              <CardDescription>
                {customer.email} · {customer.loyaltyTier} tier · {customer.points} pts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#4F3C75]">
              <p>Lifetime value ${customer.lifetimeValue.toFixed(2)}</p>
              <p>Preferred seasons: {customer.preferences.favoriteSeasons.join(', ') || '—'}</p>
              <p>Scent profile: {customer.preferences.scentProfile.join(', ') || '—'}</p>
              <form action={updateCustomerPointsAction} className="flex items-center gap-3 pt-2">
                <input type="hidden" name="id" value={customer.id} />
                <Input
                  name="points"
                  type="number"
                  defaultValue={customer.points}
                  className="w-24 bg-white/80"
                  aria-label={`Points for ${customer.name}`}
                />
                <Button type="submit" variant="outline">
                  Update points
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="space-y-4 rounded-[3rem] border border-white/40 bg-white/70 p-6 text-[#2F1F52] shadow-lg">
        <h2 className="font-display text-2xl">Loyalty tiers</h2>
        <ul className="space-y-2 text-sm text-[#4F3C75]">
          {settings.loyalty.tiers.map((tier) => (
            <li key={tier.id}>
              <span className="font-semibold text-[#2F1F52]">{tier.id}</span>: {tier.threshold} pts · {tier.benefit}
            </li>
          ))}
        </ul>
        <p className="text-sm text-[#4F3C75]">Signup bonus: {settings.loyalty.signupBonus} pts · Referral: {settings.loyalty.referralBonus} pts</p>
      </section>
    </div>
  );
}
