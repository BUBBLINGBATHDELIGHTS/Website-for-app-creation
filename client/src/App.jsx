import { Fragment, useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import ShopPage from './pages/ShopPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import { useCart } from './context/CartContext.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutFlow from './components/CheckoutFlow.jsx';

export default function App() {
  const { state } = useCart();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const cartQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Fragment>
      <div className="min-h-screen bg-cream pb-20">
        <Routes>
          <Route
            path="/"
            element={
              <ShopPage
                onOpenCart={() => setCartOpen(true)}
                onOpenCheckout={() => setCheckoutOpen(true)}
              />
            }
          />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
        </Routes>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            className="flex flex-col items-center py-2 px-4 transition-colors text-lavender"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-house"
            >
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex flex-col items-center py-2 px-4 transition-colors text-gray-500 hover:text-mint"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-lavender text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartQuantity}
              </span>
            )}
            <span className="text-xs mt-1">Cart</span>
          </button>
          <Link
            to="/admin"
            className="flex flex-col items-center py-2 px-4 transition-colors text-gray-500 hover:text-mint"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-settings"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <span className="text-xs mt-1">Admin</span>
          </Link>
        </div>
      </nav>

      <CartDrawer open={isCartOpen} onClose={() => setCartOpen(false)} onCheckout={() => {
        setCartOpen(false);
        setCheckoutOpen(true);
      }} />
      <CheckoutFlow open={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
    </Fragment>
  );
}
