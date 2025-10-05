import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Package, Percent, PlusCircle, BarChart } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../api/client.js';
import AdminAiWorkbench from '../components/AdminAiWorkbench.jsx';

function useAdminData() {
  const overview = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => {
      const response = await api.get('/admin/overview');
      return response.data;
    }
  });

  const inventory = useQuery({
    queryKey: ['admin-inventory'],
    queryFn: async () => {
      const response = await api.get('/admin/inventory');
      return response.data;
    }
  });

  const orders = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response = await api.get('/admin/orders');
      return response.data;
    }
  });

  const customers = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const response = await api.get('/admin/customers');
      return response.data;
    }
  });

  const discounts = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: async () => {
      const response = await api.get('/admin/discounts');
      return response.data;
    }
  });

  const sales = useQuery({
    queryKey: ['admin-sales'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics/sales');
      return response.data;
    }
  });

  return { overview, inventory, orders, customers, discounts, sales };
}

export default function AdminPage() {
  const queryClient = useQueryClient();
  const { overview, inventory, orders, customers, discounts, sales } = useAdminData();
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' });
  const [discountForm, setDiscountForm] = useState({ code: '', percentage: 10 });

  const createCategory = useMutation({
    mutationFn: async () => {
      await api.post('/products/categories', categoryForm);
    },
    onSuccess: () => {
      setCategoryForm({ name: '', slug: '' });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const createDiscount = useMutation({
    mutationFn: async () => {
      await api.post('/admin/discounts', discountForm);
    },
    onSuccess: () => {
      setDiscountForm({ code: '', percentage: 10 });
      queryClient.invalidateQueries({ queryKey: ['admin-discounts'] });
    }
  });

  const updateInventory = useMutation({
    mutationFn: async ({ id, inventory, isActive }) => {
      await api.patch(`/admin/inventory/${id}`, { inventory, isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
    }
  });

  const inventoryStats = useMemo(() => {
    if (!inventory.data) {
      return { totalSkus: 0, lowStock: 0, averagePrice: 0 };
    }
    const totalSkus = inventory.data.length;
    const lowStock = inventory.data.filter((product) => product.inventory < product.inventory_threshold).length;
    const averagePrice =
      inventory.data.reduce((acc, product) => acc + Number(product.price), 0) / Math.max(totalSkus, 1);
    return { totalSkus, lowStock, averagePrice };
  }, [inventory.data]);

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal">Admin Console</h1>
            <p className="text-sm text-gray-500">
              Manage products, pricing, discounts, and customer relationships backed by Supabase.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                createCategory.mutate();
              }}
            >
              <input
                type="text"
                value={categoryForm.name}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Category name"
                className="rounded-full border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                required
              />
              <input
                type="text"
                value={categoryForm.slug}
                onChange={(event) => setCategoryForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="slug"
                className="rounded-full border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#a696dd]"
                disabled={createCategory.isPending}
              >
                <PlusCircle className="h-4 w-4" />
                {createCategory.isPending ? 'Saving…' : 'Add category'}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Package} label="Total SKUs" value={inventoryStats.totalSkus} helperText="Active product listings" />
          <StatCard
            icon={Percent}
            label="Average Price"
            value={inventory.data ? `$${inventoryStats.averagePrice.toFixed(2)}` : '—'}
            helperText="Across all products"
          />
          <StatCard
            icon={ClipboardList}
            label="Low Stock Alerts"
            value={inventoryStats.lowStock}
            helperText="Needs replenishment"
          />
          <StatCard
            icon={BarChart}
            label="Lifetime revenue"
            value={overview.data ? `$${Number(overview.data.revenue).toFixed(2)}` : '—'}
            helperText={`${overview.data?.orders ?? 0} orders • ${overview.data?.customers ?? 0} customers`}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <header className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-charcoal">Inventory</h2>
                <p className="text-sm text-gray-500">Click the quantity to update stock and toggle product visibility.</p>
              </div>
            </header>
            <div className="divide-y divide-gray-100">
              {inventory.isLoading ? (
                <p className="px-6 py-8 text-sm text-gray-500">Loading inventory…</p>
              ) : inventory.data?.length ? (
                inventory.data.map((product) => (
                  <article key={product.id} className="px-6 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-charcoal">{product.name}</p>
                      <p className="text-xs text-gray-500">Inventory threshold: {product.inventory_threshold}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        defaultValue={product.inventory}
                        onBlur={(event) =>
                          updateInventory.mutate({
                            id: product.id,
                            inventory: Number(event.target.value),
                            isActive: product.is_active
                          })
                        }
                        className="w-20 rounded-full border border-gray-200 px-3 py-1 text-sm text-gray-600"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateInventory.mutate({
                            id: product.id,
                            inventory: product.inventory,
                            isActive: !product.is_active
                          })
                        }
                        className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500"
                      >
                        {product.is_active ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="px-6 py-8 text-sm text-gray-500">No products found.</p>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-charcoal">Discounts</h2>
                <p className="text-sm text-gray-500">Offer promo codes to delight loyal customers.</p>
              </div>
            </header>
            <div className="px-6 py-4 space-y-4">
              <form
                className="flex items-center gap-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  createDiscount.mutate();
                }}
              >
                <input
                  type="text"
                  value={discountForm.code}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({ ...prev, code: event.target.value.toUpperCase() }))
                  }
                  placeholder="CODE10"
                  className="rounded-full border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                  required
                />
                <input
                  type="number"
                  value={discountForm.percentage}
                  onChange={(event) =>
                    setDiscountForm((prev) => ({ ...prev, percentage: Number(event.target.value) }))
                  }
                  min={5}
                  max={50}
                  className="w-20 rounded-full border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-semibold text-white hover:bg-[#6FA897]"
                  disabled={createDiscount.isPending}
                >
                  <Percent className="h-4 w-4" />
                  {createDiscount.isPending ? 'Saving…' : 'Create code'}
                </button>
              </form>

              <div className="space-y-2 max-h-52 overflow-y-auto">
                {discounts.data?.map((discount) => (
                  <div key={discount.id} className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-2 text-sm">
                    <span className="font-semibold text-charcoal">{discount.code}</span>
                    <span className="text-gray-500">{Number(discount.percentage).toFixed(0)}% off</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white shadow-sm">
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Orders</h2>
              <p className="text-sm text-gray-500">Monitor fulfillment across the team.</p>
            </div>
          </header>
          <div className="divide-y divide-gray-100">
            {orders.isLoading ? (
              <p className="px-6 py-8 text-sm text-gray-500">Loading orders…</p>
            ) : orders.data?.length ? (
              orders.data.map((order) => (
                <article key={order.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Order {order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-500">
                      {order.name} • {order.email}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p className="font-semibold text-charcoal">${Number(order.total).toFixed(2)}</p>
                    <p>{order.status}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="px-6 py-8 text-sm text-gray-500">No orders yet.</p>
            )}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <header className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-charcoal">Customers</h2>
            </header>
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
              {customers.data?.map((customer) => (
                <article key={customer.id} className="px-6 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-charcoal">{customer.name}</p>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{new Date(customer.created_at).toLocaleDateString()}</p>
                    <p>{customer.loyalty_opt_in ? 'Loyalty' : 'Guest'}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 bg-white shadow-sm">
            <header className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
              <BarChart className="h-4 w-4 text-lavender" />
              <h2 className="text-lg font-semibold text-charcoal">Sales (14 days)</h2>
            </header>
            <div className="h-64 px-6 py-4">
              {sales.data?.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sales.data.map((row) => ({ day: row.day, revenue: Number(row.revenue) }))}>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis tickFormatter={(value) => `$${value}`.replace('.00', '')} width={60} />
                    <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Line type="monotone" dataKey="revenue" stroke="#7FB9A7" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">No sales data yet.</p>
              )}
            </div>
          </div>
        </section>

        <AdminAiWorkbench />
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, helperText }) {
  return (
    <article className="rounded-3xl border border-gray-200 bg-white px-5 py-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-lavender/15 p-3 text-lavender">
          <Icon className="h-6 w-6" />
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
