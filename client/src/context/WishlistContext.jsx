import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext({
  items: [],
  loading: false,
  error: null,
  refresh: () => {},
  add: async () => {},
  remove: async () => {}
});

export function WishlistProvider({ children }) {
  const { user, role } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWishlist = useCallback(async () => {
    if (!user || (role !== 'customer' && role !== 'admin')) {
      setItems([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/wishlist');
      setItems(response.data.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unable to load wishlist'));
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const add = useCallback(
    async (productId) => {
      if (!user) {
        throw new Error('Sign in to save items to your wishlist');
      }
      await api.post('/wishlist', { productId });
      await loadWishlist();
    },
    [user, loadWishlist]
  );

  const remove = useCallback(
    async (productId) => {
      await api.delete(`/wishlist/${productId}`);
      await loadWishlist();
    },
    [loadWishlist]
  );

  const value = useMemo(
    () => ({ items, loading, error, refresh: loadWishlist, add, remove }),
    [items, loading, error, loadWishlist, add, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
