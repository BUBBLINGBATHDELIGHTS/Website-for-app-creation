import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ClipboardList, Package, Percent, Users, PlusCircle } from 'lucide-react';
import api from '../api/client.js';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: 'all' });

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    }
  });

  const inventoryStats = useMemo(() => {
    if (products.length === 0) {
      return { totalSkus: 0, lowStock: 0, averagePrice: 0 };
    }
    const totalSkus = products.length;
    const lowStock = products.filter((product) => product.inventory < 25).length;
    const averagePrice = products.reduce((acc, product) => acc + product.price, 0) / totalSkus;
    return { totalSkus, lowStock, averagePrice };
  }, [products]);

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/products', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-charcoal">Admin Console</h1>
            <p className="text-sm text-gray-500">Manage products, pricing and fulfillment.</p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#a696dd]"
            onClick={() =>
              createMutation.mutate({
                name: 'Seasonal Surprise',
                price: 19.99,
                category: 'Limited',
                inventory: 25,
                imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
              })
            }
            disabled={createMutation.isPending}
          >
            <PlusCircle className="h-4 w-4" />
            {createMutation.isPending ? 'Adding…' : 'Quick Add Product'}
          </button>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {isError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            Unable to load products from Supabase. Confirm your API URL and database connection.
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard
            icon={Package}
            label="Total SKUs"
            value={inventoryStats.totalSkus}
            helperText="Active product listings"
          />
          <StatCard
            icon={Percent}
            label="Average Price"
            value={products.length > 0 ? `$${inventoryStats.averagePrice.toFixed(2)}` : '—'}
            helperText="Across all products"
          />
          <StatCard
            icon={ClipboardList}
            label="Low Stock Alerts"
            value={inventoryStats.lowStock}
            helperText="Items under 25 units"
          />
        </section>

        <section className="bg-white rounded-3xl border border-gray-200 shadow-sm">
          <header className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Inventory</h2>
              <p className="text-sm text-gray-500">
                Keep shelves stocked and update pricing without disturbing the storefront styling.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={filters.status}
                onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 focus:border-mint focus:outline-none"
              >
                <option value="all">All statuses</option>
                <option value="low">Low stock</option>
                <option value="in-stock">In stock</option>
              </select>
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Team: Operations</span>
              </div>
            </div>
          </header>
          {isLoading ? (
            <div className="flex items-center justify-center px-6 py-12 text-sm text-gray-500">Loading catalogue…</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {products.length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-gray-500">
                  No products found. Add items above or seed your Supabase database.
                </div>
              ) : (
                products
                  .filter((product) => {
                    if (filters.status === 'low') {
                      return product.inventory < 25;
                    }
                    if (filters.status === 'in-stock') {
                      return product.inventory >= 25;
                    }
                    return true;
                  })
                  .map((product) => {
                    const status = product.inventory < 25 ? 'Low' : 'Healthy';
                    const statusColor = status === 'Low' ? 'bg-red-100 text-red-600' : 'bg-mint/20 text-mint';
                    return (
                      <article key={product.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={product.imageUrl} alt={product.name} className="h-20 w-20 rounded-2xl object-cover" />
                          <div>
                            <h3 className="font-semibold text-charcoal">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.category}</p>
                            <p className="text-xs text-gray-400">SKU: {product.id.slice(0, 8)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="text-lg font-semibold text-charcoal">${product.price.toFixed(2)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Inventory</p>
                            <p className="text-lg font-semibold text-charcoal">{product.inventory}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>{status}</span>
                        </div>
                      </article>
                    );
                  })
              )}
            </div>
          )}
        </section>
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
