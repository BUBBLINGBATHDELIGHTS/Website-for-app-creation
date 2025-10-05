import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Star, ArrowLeft, Heart, Sparkles } from 'lucide-react';
import api from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function useProduct(productId) {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await api.get(`/products/${productId}`);
      return response.data;
    }
  });
}

export default function ProductDetailPage() {
  const { productId } = useParams();
  const { dispatch } = useCart();
  const queryClient = useQueryClient();
  const { role } = useAuth();
  const { items: wishlistItems, add, remove } = useWishlist();
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });

  const { data: product, isLoading, isError } = useProduct(productId);

  const reviewMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(`/products/${productId}/reviews`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', productId] });
      queryClient.invalidateQueries({ queryKey: ['product-reviews', productId] });
      setReviewForm({ rating: 5, title: '', body: '' });
    }
  });

  const wishlistSet = new Set(wishlistItems.map((item) => item.id));
  const inWishlist = wishlistSet.has(productId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading product…</p>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="rounded-3xl bg-white px-8 py-6 text-center shadow-sm">
          <p className="text-sm text-gray-500">Unable to load this product.</p>
          <Link to="/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-lavender">
            <ArrowLeft className="h-4 w-4" /> Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>
        {role === 'customer' || role === 'admin' ? (
          <button
            type="button"
            onClick={() => (inWishlist ? remove(product.id) : add(product.id))}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              inWishlist ? 'bg-lavender text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Heart className="h-4 w-4 mr-1 inline" fill={inWishlist ? 'currentColor' : 'none'} />
            {inWishlist ? 'Saved' : 'Save for later'}
          </button>
        ) : null}
      </header>

      <main className="px-4 py-6 space-y-6">
        <section className="rounded-3xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid gap-6 sm:grid-cols-2">
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-mint/20 px-3 py-1 text-xs font-semibold text-mint">
                  {product.categories?.[0]?.name ?? 'Signature Collection'}
                </span>
                <span className="text-sm text-gray-400">{product.related?.length ?? 0} complementary picks</span>
              </div>
              <h1 className="text-2xl font-semibold text-charcoal">{product.name}</h1>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-bold text-charcoal">${product.price.toFixed(2)}</p>
                {product.compareAtPrice && (
                  <p className="text-sm text-gray-400 line-through">${product.compareAtPrice.toFixed(2)}</p>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="h-4 w-4 text-yellow-400" />
                {product.rating?.toFixed(1)} • {product.reviews.length} reviews
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
                className="w-full rounded-full bg-mint px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#6FA897]"
              >
                Add to cart
              </button>
              <div className="rounded-2xl bg-lavender/10 px-4 py-3 text-sm text-lavender flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Earn 10% off instantly when you create an account during checkout.
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
          <header className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal">Reviews</h2>
            <span className="text-sm text-gray-500">Share your ritual experience</span>
          </header>

          <div className="space-y-4">
            {product.reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-200 px-4 py-6 text-sm text-gray-500">
                No reviews yet. Be the first to leave some tub-side feedback!
              </p>
            ) : (
              product.reviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="font-semibold text-charcoal">{review.rating}/5</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.title && <h3 className="text-sm font-semibold text-charcoal mt-1">{review.title}</h3>}
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.body}</p>
                  <p className="mt-2 text-xs text-gray-400">— {review.customerName}</p>
                </article>
              ))
            )}
          </div>

          {role === 'customer' && (
            <form
              className="grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                reviewMutation.mutate(reviewForm);
              }}
            >
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                >
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <option key={rating} value={rating}>
                      {rating} stars
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Title</label>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, title: event.target.value }))}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                  placeholder="Lavender bliss in a fizz"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">Your review</label>
                <textarea
                  value={reviewForm.body}
                  required
                  onChange={(event) => setReviewForm((prev) => ({ ...prev, body: event.target.value }))}
                  rows={4}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                  placeholder="Tell other soakers about your ritual…"
                />
              </div>
              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="inline-flex items-center justify-center rounded-full bg-lavender px-4 py-2 text-sm font-semibold text-white hover:bg-[#a696dd]"
              >
                {reviewMutation.isPending ? 'Publishing…' : 'Submit review'}
              </button>
              {reviewMutation.error && (
                <p className="text-sm text-red-500">
                  {(reviewMutation.error instanceof Error && reviewMutation.error.message) || 'Unable to submit review'}
                </p>
              )}
            </form>
          )}
        </section>

        {product.related?.length > 0 && (
          <section className="rounded-3xl bg-white border border-gray-100 shadow-sm p-6 space-y-3">
            <h2 className="text-lg font-semibold text-charcoal">Recommended pairings</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {product.related.map((related) => (
                <Link
                  key={related.id}
                  to={`/products/${related.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-3 hover:border-lavender"
                >
                  <img src={related.imageUrl} alt={related.name} className="h-16 w-16 rounded-2xl object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{related.name}</p>
                    <p className="text-xs text-gray-500">${related.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
