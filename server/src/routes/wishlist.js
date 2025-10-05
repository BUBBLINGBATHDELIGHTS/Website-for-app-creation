import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../lib/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth({ allowedRoles: ['customer', 'admin'] }));

router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const customer = await db('customers')
      .where({ supabase_user_id: req.user.id })
      .first();

    if (!customer) {
      return res.json({ items: [] });
    }

    const wishlist = await db('wishlists')
      .where({ customer_id: customer.id })
      .first();

    if (!wishlist) {
      return res.json({ items: [] });
    }

    const items = await db('wishlist_items')
      .leftJoin('products', 'wishlist_items.product_id', 'products.id')
      .where('wishlist_items.wishlist_id', wishlist.id)
      .select(
        'products.id',
        'products.name',
        'products.price',
        'products.image_url',
        'products.inventory'
      );

    res.json({
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        imageUrl: item.image_url,
        inventory: item.inventory
      }))
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const schema = z.object({ productId: z.string().uuid() });
    const payload = schema.parse(req.body);
    const db = getDb();

    let customer = await db('customers').where({ supabase_user_id: req.user.id }).first();
    if (!customer) {
      const [created] = await db('customers')
        .insert({
          supabase_user_id: req.user.id,
          email: req.user.email,
          name: req.user.user_metadata?.full_name || req.user.email,
          has_account: true
        })
        .returning('*');
      customer = created;
    }

    let wishlist = await db('wishlists').where({ customer_id: customer.id }).first();
    if (!wishlist) {
      const [createdWishlist] = await db('wishlists')
        .insert({ customer_id: customer.id })
        .returning('*');
      wishlist = createdWishlist;
    }

    await db('wishlist_items')
      .insert({
        wishlist_id: wishlist.id,
        product_id: payload.productId
      })
      .onConflict(['wishlist_id', 'product_id'])
      .ignore();

    res.status(201).json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    const db = getDb();
    const customer = await db('customers')
      .where({ supabase_user_id: req.user.id })
      .first();

    if (!customer) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    const wishlist = await db('wishlists').where({ customer_id: customer.id }).first();
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    await db('wishlist_items')
      .where({ wishlist_id: wishlist.id, product_id: req.params.productId })
      .del();

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
