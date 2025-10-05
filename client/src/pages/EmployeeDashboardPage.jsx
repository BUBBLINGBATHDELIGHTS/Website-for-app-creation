import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Package, ClipboardList, Mail } from 'lucide-react';
import api from '../api/client.js';

function useEmployeeOrders() {
  return useQuery({
    queryKey: ['employee-orders'],
    queryFn: async () => {
      const response = await api.get('/employees/orders');
      return response.data;
    }
  });
}

function useInquiries() {
  return useQuery({
    queryKey: ['employee-inquiries'],
    queryFn: async () => {
      const response = await api.get('/employees/inquiries');
      return response.data;
    }
  });
}

export default function EmployeeDashboardPage() {
  const { data: orders = [] } = useEmployeeOrders();
  const { data: inquiries = [] } = useInquiries();
  const queryClient = useQueryClient();
  const [activeOrder, setActiveOrder] = useState(null);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.patch(`/employees/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-orders'] });
    }
  });

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-semibold text-charcoal">Fulfillment queue</h1>
        <p className="text-sm text-gray-500">
          Track paid orders, update statuses, and respond to customer inquiries.
        </p>
      </header>

      <main className="px-4 py-6 space-y-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard icon={Package} label="Orders today" value={orders.length} helperText="Awaiting fulfillment" />
          <StatCard icon={ClipboardList} label="Active inquiries" value={inquiries.length} helperText="Customers awaiting replies" />
          <StatCard icon={Mail} label="Ready to ship" value={orders.filter((order) => order.status === 'ready').length} helperText="Prep labels" />
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Orders</h2>
              <p className="text-sm text-gray-500">Tap an order to update its status and trigger customer notifications.</p>
            </div>
          </header>
          <div className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-500">No orders yet. New orders will appear instantly.</p>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="px-6 py-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-charcoal">Order {order.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">
                        {order.customer?.name} • {order.customer?.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">${Number(order.total).toFixed(2)}</span>
                      <select
                        value={order.status}
                        onChange={(event) =>
                          updateStatus.mutate({ id: order.id, status: event.target.value })
                        }
                        className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs text-gray-600"
                      >
                        <option value="processing">Processing</option>
                        <option value="ready">Ready</option>
                        <option value="shipped">Shipped</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveOrder(activeOrder === order.id ? null : order.id)}
                    className="text-xs font-semibold text-lavender"
                  >
                    {activeOrder === order.id ? 'Hide items' : 'Show items'}
                  </button>
                  {activeOrder === order.id && (
                    <ul className="grid gap-1 text-xs text-gray-500">
                      {order.items.map((item) => (
                        <li key={`${order.id}-${item.name}`}>{item.quantity} × {item.name}</li>
                      ))}
                    </ul>
                  )}
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-100 bg-white shadow-sm">
          <header className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-charcoal">Customer inquiries</h2>
          </header>
          <div className="divide-y divide-gray-100">
            {inquiries.length === 0 ? (
              <p className="px-6 py-8 text-sm text-gray-500">No open tickets. Enjoy a tea break!</p>
            ) : (
              inquiries.map((inquiry) => (
                <article key={inquiry.id} className="px-6 py-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-semibold text-charcoal">{inquiry.subject}</p>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{inquiry.status}</span>
                  </div>
                  <p className="text-xs text-gray-500">{inquiry.customer_email}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{inquiry.message}</p>
                  <p className="text-xs text-gray-400">Assigned to {inquiry.assignee ?? 'unassigned'}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helperText }) {
  return (
    <article className="rounded-3xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-lavender/15 p-3 text-lavender">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-semibold text-charcoal">{value}</p>
          <p className="text-xs text-gray-400">{helperText}</p>
        </div>
      </div>
    </article>
  );
}
