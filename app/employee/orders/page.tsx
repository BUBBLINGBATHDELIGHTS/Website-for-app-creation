import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders · Employee Console',
};

async function advanceOrderAction(formData: FormData) {
  'use server';
  console.info('TODO: advance order status', formData.get('orderId'));
}

async function escalateOrderAction(formData: FormData) {
  'use server';
  console.warn('TODO: escalate order', formData.get('orderId'));
}

// Placeholder orders; replace with live Supabase data once available.
const orders = [
  {
    id: 'ORD-2084',
    customer: 'Avery Lumen',
    status: 'Ready to pack',
    total: 118.5,
  },
  {
    id: 'ORD-2091',
    customer: 'Kai River',
    status: 'Awaiting DID confirmation',
    total: 64.0,
  },
];

export default function EmployeeOrdersPage() {
  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardHeader>
            <CardTitle>{order.id}</CardTitle>
            <CardDescription>
              {order.customer} · <span className="font-semibold text-purple-900">${order.total.toFixed(2)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={advanceOrderAction} className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
              <input type="hidden" name="orderId" value={order.id} />
              <span className="rounded-full bg-blush-100 px-4 py-2 text-sm font-semibold text-purple-700">{order.status}</span>
              <div className="flex gap-3">
                <Button type="submit">Advance status</Button>
                <Button type="submit" variant="outline" formAction={escalateOrderAction}>
                  Escalate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
