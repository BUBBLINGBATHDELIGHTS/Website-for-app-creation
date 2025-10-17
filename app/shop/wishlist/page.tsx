import { Metadata } from 'next';
import { WishlistView } from '@/components/product/wishlist-view';

export const metadata: Metadata = {
  title: 'Wishlist · Bubbling Bath Delights',
};

export default function WishlistPage() {
  return <WishlistView />;
}
