import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function WishlistPage() {
  const { items, loading, remove } = useWishlist();
  const { dispatch } = useCart();

  return (
    <div className="min-h-screen bg-cream pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-charcoal">Your wishlist</h1>
            <p className="text-sm text-gray-500">Save dreamy soaks for later and add them to your ritual anytime.</p>
          </div>
          <Link to="/" className="text-sm font-semibold text-lavender">
            Continue shopping
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 space-y-4">
        {loading ? (
          <p className="rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center text-sm text-gray-500">
            Loading your wishlist…
          </p>
        ) : items.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500">
            Your wishlist is sparkling clean. Tap the hearts in the shop to save favorites.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <img src={item.imageUrl} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
                  <div className="flex-1 space-y-2">
                    <h2 className="text-sm font-semibold text-charcoal">{item.name}</h2>
                    <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          dispatch({
                            type: 'ADD_ITEM',
                            payload: { id: item.id, name: item.name, price: item.price, quantity: 1 }
                          })
                        }
                        className="rounded-full bg-mint px-4 py-2 text-xs font-semibold text-white hover:bg-[#6FA897]"
                      >
                        Move to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        className="rounded-full border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
