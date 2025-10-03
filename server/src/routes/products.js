import { Router } from 'express';
import { z } from 'zod';
import { getPool } from '../lib/database.js';
import { listProducts, createProduct } from '../lib/store.js';

const router = Router();

const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10).optional(),
  category: z.string().min(2),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  imageUrl: z.string().url(),
  inventory: z.number().int().positive().default(50)
});

router.get('/', async (_req, res, next) => {
  try {
    const pool = getPool();
    if (!pool) {
      res.json(listProducts());
      return;
    }

    const { rows } = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      category: row.category,
      price: Number(row.price),
      compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : null,
      imageUrl: row.image_url,
      inventory: row.inventory,
      rating: Number(row.rating || 4.8),
      reviews: Number(row.reviews || 32),
      badges: row.badges || []
    })));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = createProductSchema.parse(req.body);
    const pool = getPool();
    if (!pool) {
      const created = createProduct(payload);
      res.status(201).json(created);
      return;
    }

    const result = await pool.query(
      `INSERT INTO products (name, description, category, price, compare_at_price, image_url, inventory)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [
        payload.name,
        payload.description || null,
        payload.category,
        payload.price,
        payload.compareAtPrice || null,
        payload.imageUrl,
        payload.inventory
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

export default router;
