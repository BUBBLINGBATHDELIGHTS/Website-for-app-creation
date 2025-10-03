import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Search, Star, Filter, Sparkles, Timer, Flame, Bell, UserPlus } from 'lucide-react';
import api from '../api/client.js';
import { demoProducts, categories } from '../data/initialProducts.js';
import { useCart } from '../context/CartContext.jsx';

function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    },
    initialData: demoProducts
  });
}

export default function ShopPage({ onOpenCart, onOpenCheckout }) {
  const { dispatch, state } = useCart();
  const { data: products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  useEffect(() => {
    if (state.customer?.hasAccount) {
      dispatch({
        type: 'APPLY_DISCOUNT',
        payload: { code: 'LOYALTY10', amount: 0.1 }
      });
    }
  }, [state.customer?.hasAccount, dispatch]);

  return (
    <div className="pb-20">
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-lavender to-mint rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">B</span>
            </div>
            <span className="ml-2 font-bold text-charcoal">Bubbling Bath Delights</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors" type="button">
              <Bell className="h-5 w-5 text-gray-600" />
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
              onClick={onOpenCheckout}
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
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">Create a boutique account</p>
                  <p className="text-xs text-gray-500">Unlock an instant 10% discount and start earning fizz points.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  dispatch({
                    type: 'SET_CUSTOMER',
                    payload: {
                      email: state.customer?.email || 'guest@bubblingbath.com',
                      name: state.customer?.name || 'Guest',
                      hasAccount: true
                    }
                  })
                }
                className="rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#a696dd]"
              >
                Activate 10% off
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search bubbly delights"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white px-10 py-2 text-sm focus:border-mint focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-lavender text-white border-lavender shadow-sm'
                      : 'border-gray-200 text-gray-600 hover:border-mint'
                  }`}
                >
                  {category}
                </button>
              ))}
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:border-mint"
              >
                <Filter className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
          <div className="flex items-center mb-2">
            <Sparkles className="text-lavender mr-2 h-5 w-5" />
            <h2 className="text-xl font-bold text-charcoal">For You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover" />
                  {product.badges?.[0] && (
                    <span className="absolute top-2 left-2 bg-lavender text-white px-2 py-1 rounded-full text-xs font-medium">
                      {product.badges[0]}
                    </span>
                  )}
                  <button className="absolute top-2 right-2 p-2 rounded-full bg-white text-gray-400 hover:text-red-500" type="button">
                    <Heart className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-charcoal mb-1 line-clamp-2">{product.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-600 ml-1">
                        {product.rating.toFixed(1)} ({product.reviews})
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{product.inventory} in stock</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-charcoal">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</span>
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
                      className="bg-mint text-white p-2 rounded-full hover:bg-[#6FA897] transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-shopping-cart"
                      >
                        <circle cx="8" cy="21" r="1"></circle>
                        <circle cx="19" cy="21" r="1"></circle>
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
