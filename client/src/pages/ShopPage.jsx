import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Search, Sparkles, Timer, Flame, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' }
];

function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/products/categories');
      return response.data;
    }
  });
}

function useProducts(filters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await api.get('/products', { params: filters });
      return response.data;
    },
    keepPreviousData: true
  });
}

export default function ShopPage({ onOpenCart, onStartCustomizing }) {
  const { dispatch, state } = useCart();
  const { role } = useAuth();
  const { items: wishlistItems, add: addToWishlist, remove: removeFromWishlist } = useWishlist();
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 8,
    category: '',
    sort: 'newest',
    search: '',
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: categoryData } = useCategories();
  const { data, isLoading } = useProducts({
    ...filters,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    category: filters.category || undefined
  });

  const wishlistIds = useMemo(() => new Set(wishlistItems.map((item) => item.id)), [wishlistItems]);

  const products = data?.products ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  const subtotal = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const loyaltyDiscount = state.customer?.hasAccount ? subtotal * 0.1 : 0;
  const total = subtotal - loyaltyDiscount;

  function toggleWishlist(productId) {
    if (wishlistIds.has(productId)) {
      removeFromWishlist(productId).catch((error) => {
        console.error(error);
      });
    } else {
      addToWishlist(productId).catch((error) => {
        console.error(error);
        alert(error.message);
      });
    }
  }

  return (
    <div className="pb-24">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-lavender to-mint rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="ml-2 font-bold text-charcoal">Bubbling Bath Delights</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <SlidersHorizontal className="h-5 w-5 text-gray-600" />
            </button>
            <button
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
              onClick={onOpenCart}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-shopping-cart text-gray-600"
              >
                <circle cx="8" cy="21" r="1"></circle>
                <circle cx="19" cy="21" r="1"></circle>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="pt-16">
        <section className="relative h-64 bg-gradient-to-r from-lavender to-mint overflow-hidden">
          <img
            src="https://d64gsuwffb70l.cloudfront.net/68b7b8a4ad1c1d7f42a7d2ca_1756870866538_34ff02d4.webp"
            alt="Luxury Bath Experience"
            className="w-full h-full object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Build Your Ritual</h1>
            <p className="text-white/90 mb-4">Handcrafted luxury meets playful fizz</p>
            <button
              type="button"
              onClick={onStartCustomizing}
              className="bg-white text-lavender px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Customizing
            </button>
          </div>
        </section>

        <section className="bg-gradient-to-r from-orange-400 to-red-500 text-white p-4 m-4 rounded-2xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <Flame className="mr-2 h-5 w-5" />
            <div>
              <p className="font-semibold">Flash Sale!</p>
              <p className="text-sm opacity-90">Up to 40% off bath bombs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            <span className="text-sm font-mono">23:45:12</span>
          </div>
        </section>

        <section className="px-4 mb-6 space-y-4">
          <div className="rounded-3xl border border-lavender/30 bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-lavender/15 p-3 text-lavender">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">Members save 10%</p>
                  <p className="text-xs text-gray-500">
                    Create an account during checkout to unlock automatic savings and order tracking.
                  </p>
                </div>
              </div>
              <div className="rounded-full bg-mint/10 px-4 py-2 text-sm font-medium text-mint">
                {state.customer?.hasAccount
                  ? 'Your loyalty discount is active'
                  : 'Opt-in at checkout for an instant 10% off'}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, search: event.target.value, page: 1 }))
                  }
                  placeholder="Search ritual upgrades"
                  className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-lavender focus:outline-none"
                />
              </div>
              <select
                value={filters.sort}
                onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-600 focus:border-lavender focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {showFilters && (
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setFilters((prev) => ({ ...prev, category: '', page: 1 }))}
                      className={`rounded-full px-3 py-1 text-sm ${
                        !filters.category ? 'bg-lavender text-white' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      All
                    </button>
                    {(categoryData ?? []).map((category) => (
                      <button
                        type="button"
                        key={category.id}
                        onClick={() => setFilters((prev) => ({ ...prev, category: category.id, page: 1 }))}
                        className={`rounded-full px-3 py-1 text-sm ${
                          filters.category === category.id
                            ? 'bg-lavender text-white'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Price range</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, minPrice: event.target.value, page: 1 }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, maxPrice: event.target.value, page: 1 }))
                      }
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Pagination</p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                      }
                      className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      disabled={pagination.page <= 1}
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {pagination.page} of {pagination.totalPages || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.min(pagination.totalPages || 1, prev.page + 1)
                        }))
                      }
                      className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      disabled={pagination.page >= (pagination.totalPages || 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 space-y-4">
          <header className="flex items-center mb-2">
            <Sparkles className="mr-2 h-5 w-5 text-lavender" />
            <h2 className="text-xl font-bold text-charcoal">For You</h2>
          </header>

          {isLoading ? (
            <div className="rounded-2xl border border-gray-100 bg-white px-6 py-12 text-center text-sm text-gray-500">
              Loading catalogue…
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 px-6 py-10 text-center text-sm text-gray-500">
              No products match these filters yet. Adjust your filters or add items from the admin console.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <Link to={`/products/${product.id}`} className="block">
                    <div className="relative">
                      <img src={product.imageUrl} alt={product.name} className="w-full h-56 object-cover" />
                      {product.badges?.[0] && (
                        <span className="absolute top-2 left-2 bg-lavender text-white px-2 py-1 rounded-full text-xs font-medium">
                          {product.badges[0]}
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-charcoal">{product.name}</h3>
                        <p className="text-xs text-gray-500">
                          {product.categories?.map((category) => category.name).join(', ') || 'Signature'}
                        </p>
                      </div>
                      {['customer', 'admin'].includes(role) && (
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          className={`rounded-full p-2 transition-colors ${
                            wishlistIds.has(product.id)
                              ? 'bg-lavender text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          aria-label={wishlistIds.has(product.id) ? 'Remove from wishlist' : 'Save to wishlist'}
                        >
                          <Heart className="h-4 w-4" fill={wishlistIds.has(product.id) ? 'currentColor' : 'none'} />
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-x-2 text-sm">
                        <span className="text-lg font-bold text-charcoal">${product.price.toFixed(2)}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-gray-400 line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'ADD_ITEM',
                            payload: {
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              quantity: 1,
                              imageUrl: product.imageUrl
                            }
                          })
                        }
                        className="rounded-full bg-mint px-4 py-2 text-sm font-semibold text-white hover:bg-[#6FA897]"
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {subtotal > 0 && (
          <section className="mx-4 my-6 rounded-3xl border border-mint/20 bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold text-charcoal">Order summary</h3>
            <dl className="mt-3 space-y-1 text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <dt>Subtotal</dt>
                <dd>${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Loyalty discount</dt>
                <dd className="text-mint">-${loyaltyDiscount.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between font-semibold text-charcoal">
                <dt>Total</dt>
                <dd>${total.toFixed(2)}</dd>
              </div>
            </dl>
          </section>
        )}
      </main>
    </div>
  );
}
