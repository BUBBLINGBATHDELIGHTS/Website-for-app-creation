import { demoProducts } from '../../../client/src/data/initialProducts.js';

let products = [...demoProducts];
let orders = [];

export function listProducts() {
  return products;
}

export function createProduct(product) {
  const newProduct = {
    id: product.id || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    inventory: 50,
    rating: 4.8,
    reviews: 12,
    badges: ['New'],
    compareAtPrice: null,
    ...product
  };
  products = [newProduct, ...products];
  return newProduct;
}

export function listOrders() {
  return orders;
}

export function createOrder(order) {
  const newOrder = {
    id: `ORD-${(orders.length + 1).toString().padStart(4, '0')}`,
    createdAt: new Date().toISOString(),
    status: 'processing',
    timeline: [
      { status: 'Order Placed', description: 'We received your order', timestamp: new Date().toISOString() },
      {
        status: 'In Production',
        description: 'Hand-pressing your artisanal goodies',
        timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      },
      {
        status: 'Ready to Ship',
        description: 'Packed with eco-friendly materials',
        timestamp: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      }
    ],
    fulfillment: {
      carrier: 'BubblePost',
      trackingNumber: `BB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    },
    rewardProgress: Math.min(100, Math.round(order.totals.total * 5)),
    tier: order.totals.total > 150 ? 'VIP Splash' : 'Soak Star',
    ...order
  };

  orders = [newOrder, ...orders];
  return newOrder;
}

export function findOrderById(orderId) {
  return orders.find((order) => order.id === orderId);
}
