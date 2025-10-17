import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { listOrders } from '@/lib/data/orders';
import { approveOrderAction, denyOrderAction } from './actions';
import { Textarea } from '@/components/shared/textarea';

export const revalidate = 60;

export default async function AdminOrdersPage() {
  const orders = await listOrders();
  const pending = orders.filter((order) => order.status === 'pending');
  const processed = orders.filter((order) => order.status !== 'pending');

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-[#2F1F52]">Order approvals</h1>
        <p className="text-sm text-[#4F3C75]">Review pending orders, approve for fulfilment, or deny with a rationale.</p>
      </div>
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[#2F1F52]">Pending</h2>
        <div className="space-y-4">
          {pending.map((order) => (
            <Card key={order.id}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{order.id}</CardTitle>
                  <CardDescription>
                    {order.shipping.name} · {order.items.length} items · ${order.total.toFixed(2)}
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <form action={approveOrderAction}>
                    <input type="hidden" name="id" value={order.id} />
                    <Button type="submit">Approve</Button>
                  </form>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-3xl bg-white/70 p-4 text-sm text-[#4F3C75]">
                  <p className="font-semibold text-[#2F1F52]">Items</p>
                  <ul className="mt-2 space-y-1">
                    {order.items.map((item) => (
                      <li key={item.productId}>{item.quantity} × {item.name}</li>
                    ))}
                  </ul>
                </div>
                <form action={denyOrderAction} className="space-y-3">
                  <input type="hidden" name="id" value={order.id} />
                  <Textarea name="reason" rows={3} placeholder="Reason for denial" className="bg-white/80" required />
                  <Button type="submit" variant="outline">
                    Deny & refund
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
          {pending.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-[#4F3C75]">
                All orders are in motion. New approvals will appear here.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-2xl text-[#2F1F52]">Recently processed</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {processed.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>{order.id}</CardTitle>
                <CardDescription>
                  {order.status.toUpperCase()} · {order.shipping.name} · ${order.total.toFixed(2)}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[#4F3C75]">
                <p>Shipping label: {order.shippingLabel ?? 'Pending'}</p>
                {order.denialReason && <p>Reason: {order.denialReason}</p>}
              </CardContent>
            </Card>
          ))}
          {processed.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-sm text-[#4F3C75]">
                No processed orders yet.
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
