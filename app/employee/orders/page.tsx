import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders · Employee Console',
};

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
              {order.customer} · <span className="font-semibold text-[#2F1F52]">${order.total.toFixed(2)}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <span className="rounded-full bg-[#F2ECFB] px-4 py-2 text-sm font-semibold text-[#4F3C75]">{order.status}</span>
            <div className="flex gap-3">
              <Button>Advance status</Button>
              <Button variant="outline">Escalate</Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
