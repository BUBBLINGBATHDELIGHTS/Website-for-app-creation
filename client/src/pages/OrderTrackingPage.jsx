import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { PackageCheck, Truck, CheckCircle2, MapPin, Loader2 } from 'lucide-react';
import api from '../api/client.js';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    },
    enabled: Boolean(orderId)
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Loader2 className="h-8 w-8 animate-spin text-lavender" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-md rounded-3xl bg-white p-6 text-center shadow">
          <PackageCheck className="mx-auto h-12 w-12 text-red-400" />
          <h1 className="mt-4 text-xl font-semibold text-charcoal">We fizzed out</h1>
          <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        <header className="rounded-3xl bg-gradient-to-r from-lavender to-mint p-6 text-white shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-white/80">Order #{data.id}</p>
              <h1 className="text-2xl font-semibold">Thanks for the bubbly order!</h1>
            </div>
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <p className="mt-2 text-sm text-white/80">Placed on {new Date(data.createdAt).toLocaleString()}</p>
        </header>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Delivery progress</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {data.timeline.map((milestone) => (
              <div key={milestone.status} className="rounded-2xl border border-gray-100 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">{milestone.status}</p>
                <p className="mt-2 text-sm font-semibold text-charcoal">{milestone.description}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(milestone.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Shipping to</h2>
          <div className="mt-4 flex items-start gap-4">
            <MapPin className="h-6 w-6 text-lavender" />
            <div className="text-sm text-gray-600">
              <p className="font-semibold text-charcoal">{data.customer.name}</p>
              <p>{data.customer.address}</p>
              <p>
                {data.customer.city}, {data.customer.postalCode}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Items</h2>
          <div className="mt-4 space-y-4">
            {data.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <img src={item.imageUrl} alt={item.name} className="h-12 w-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-medium text-charcoal">{item.name}</p>
                    <p className="text-gray-500">Qty {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-charcoal">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${data.totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Discounts</span>
            <span>- ${data.totals.discount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-base font-semibold text-charcoal">
            <span>Total</span>
            <span>${data.totals.total.toFixed(2)}</span>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-charcoal">Fulfillment</h2>
          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
              <Truck className="h-6 w-6 text-mint" />
              <div>
                <p className="font-medium text-charcoal">Carrier</p>
                <p className="text-sm text-gray-500">{data.fulfillment.carrier}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
              <PackageCheck className="h-6 w-6 text-lavender" />
              <div>
                <p className="font-medium text-charcoal">Tracking number</p>
                <p className="text-sm text-gray-500">{data.fulfillment.trackingNumber}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
