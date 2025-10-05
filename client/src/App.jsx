import { Fragment, useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart } from 'lucide-react';
import ShopPage from './pages/ShopPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import EmployeeDashboardPage from './pages/EmployeeDashboardPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import WorkingWithBubblesPage from './pages/WorkingWithBubblesPage.jsx';
import { useCart } from './context/CartContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { useWorkspaceAccess } from './context/WorkspaceAccessContext.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import CheckoutFlow from './components/CheckoutFlow.jsx';
import RequireAdmin from './components/RequireAdmin.jsx';
import RequireWorkspaceAccess from './components/RequireWorkspaceAccess.jsx';
import supabase from './lib/supabaseClient.js';

export default function App() {
  const { state } = useCart();
  const { role, user } = useAuth();
  const { hasAccess } = useWorkspaceAccess();
  const navigate = useNavigate();
  const [isCartOpen, setCartOpen] = useState(false);
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const cartQuantity = state.items.reduce((sum, item) => sum + item.quantity, 0);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  }

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
          <Route
            path="/admin"
            element={
              <RequireWorkspaceAccess>
                <RequireAdmin>
                  <AdminPage />
                </RequireAdmin>
              </RequireWorkspaceAccess>
            }
          />
          <Route path="/products/:productId" element={<ProductDetailPage />} />
          <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
          <Route
            path="/employee"
            element={
              <RequireWorkspaceAccess>
                <RequireAdmin allowedRoles={['employee', 'admin']}>
                  <EmployeeDashboardPage />
                </RequireAdmin>
              </RequireWorkspaceAccess>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/work-with-bubbles" element={<WorkingWithBubblesPage />} />
          <Route
            path="/wishlist"
            element={
              <RequireAdmin allowedRoles={['customer', 'admin']}>
                <WishlistPage />
              </RequireAdmin>
            }
          />
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
          {role === 'customer' || role === 'admin' ? (
            <Link
              to="/wishlist"
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
                className="lucide lucide-heart"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
              </svg>
              <span className="text-xs mt-1">Wishlist</span>
            </Link>
          ) : null}
          {role === 'admin' ? (
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
          ) : role === 'employee' ? (
            <Link
              to="/employee"
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
                className="lucide lucide-badge-check"
              >
                <path d="M7.5 4.21 12 2l4.5 2.21 4 3.58-1 4.95 1 4.95-4 3.58L12 22l-4.5-2.21-4-3.58 1-4.95-1-4.95z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span className="text-xs mt-1">Fulfillment</span>
            </Link>
          ) : hasAccess ? (
            <Link
              to="/work-with-bubbles"
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
                className="lucide lucide-shield-check"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M7.4 2.27a2 2 0 0 0-1.39 1.9v5.4c0 5.3 3.25 10.12 8 11.73 4.75-1.6 8-6.42 8-11.73v-5.4a2 2 0 0 0-1.39-1.9l-6-2.18a2 2 0 0 0-1.22 0z" />
              </svg>
              <span className="text-xs mt-1">Workspace</span>
            </Link>
          ) : (
            <Link
              to={user ? '/' : '/login'}
              className="flex flex-col items-center py-2 px-4 transition-colors text-gray-500 hover:text-mint"
              onClick={async (event) => {
                if (user) {
                  event.preventDefault();
                  await handleSignOut();
                }
              }}
            >
              {user ? (
                <>
                  <LogOut className="h-6 w-6" />
                  <span className="text-xs mt-1">Sign out</span>
                </>
              ) : (
                <>
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
                    className="lucide lucide-user"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span className="text-xs mt-1">Login</span>
                </>
              )}
            </Link>
          )}
        </div>
      </nav>

      <CartDrawer
        open={isCartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />
      <CheckoutFlow open={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
    </Fragment>
  );
}
