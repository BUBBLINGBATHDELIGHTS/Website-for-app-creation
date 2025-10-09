import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cart · Bubbling Bath Delights',
};

const items = [
  { id: '1', name: 'Lavender Orbit', quantity: 1, price: 28 },
  { id: '2', name: 'Eucalyptus Echo', quantity: 2, price: 18 },
];

export default function CartPage() {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  return (
    <div className="space-y-6">
      {items.map((item) => (
        <Card key={item.id} className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>Qty {item.quantity}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
            <span className="text-lg font-semibold text-purple-900">${(item.price * item.quantity).toFixed(2)}</span>
            <div className="flex gap-3">
              <Button variant="outline">Adjust</Button>
              <Button variant="ghost">Remove</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <CardHeader>
          <CardTitle>Subtotal</CardTitle>
          <CardDescription>Includes seasonal 10% membership incentive.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <span className="text-2xl font-semibold text-purple-900">${(subtotal * 0.9).toFixed(2)}</span>
          <Button size="lg">Proceed to checkout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
