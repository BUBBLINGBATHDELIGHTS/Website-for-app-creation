import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../lib/database.js';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10).optional(),
  category: z.string().min(2),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  imageUrl: z.string().url(),
  inventory: z.number().int().nonnegative().default(0)
});

router.get('/', async (_req, res, next) => {
  try {
    const db = getDb();
    const rows = await db('products').select('*').orderBy('created_at', 'desc');

    res.json(
      rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        price: Number(row.price),
        compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
        imageUrl: row.image_url,
        inventory: row.inventory,
        rating: Number(row.rating ?? 4.8),
        reviews: Number(row.reviews ?? 0),
        badges: row.badges ?? []
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = createProductSchema.parse(req.body);
    const db = getDb();

    const [product] = await db('products')
      .insert({
        name: payload.name,
        description: payload.description ?? null,
        category: payload.category,
        price: payload.price,
        compare_at_price: payload.compareAtPrice ?? null,
        image_url: payload.imageUrl,
        inventory: payload.inventory,
        rating: 4.8,
        reviews: 0
      })
      .returning('*');

    res.status(201).json({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
      imageUrl: product.image_url,
      inventory: product.inventory,
      rating: Number(product.rating ?? 4.8),
      reviews: Number(product.reviews ?? 0),
      badges: product.badges ?? []
    });
  } catch (error) {
    next(error);
  }
});

export default router;
