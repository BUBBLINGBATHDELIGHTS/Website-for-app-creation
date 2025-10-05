import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../lib/database.js';
import { getCache } from '../lib/cache.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(48).default(12),
  category: z.string().optional(),
  sort: z.enum(['newest', 'price-asc', 'price-desc', 'rating']).default('newest'),
  search: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional()
});

const createProductSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10).optional(),
  categories: z.array(z.string().uuid()).default([]),
  price: z.number().positive(),
  compareAtPrice: z.number().positive().nullable().optional(),
  imageUrl: z.string().url(),
  inventory: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true)
});

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(3).max(120).optional(),
  body: z.string().min(10).max(1000)
});

router.get('/', optionalAuth(), async (req, res, next) => {
  try {
    const filters = paginationSchema.parse(req.query);
    const db = getDb();
    const cache = getCache();
    const cacheKey = `products:${JSON.stringify(filters)}`;

    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    const baseQuery = db('products').where('is_active', true);

    if (filters.category) {
      baseQuery.whereIn('products.id', function () {
        this.select('product_id')
          .from('product_categories')
          .where('category_id', filters.category);
      });
    }

    if (filters.search) {
      baseQuery.andWhere((query) => {
        query.whereILike('name', `%${filters.search}%`).orWhereILike(
          'description',
          `%${filters.search}%`
        );
      });
    }

    if (filters.minPrice) {
      baseQuery.andWhere('price', '>=', filters.minPrice);
    }

    if (filters.maxPrice) {
      baseQuery.andWhere('price', '<=', filters.maxPrice);
    }

    switch (filters.sort) {
      case 'price-asc':
        baseQuery.orderBy('price', 'asc');
        break;
      case 'price-desc':
        baseQuery.orderBy('price', 'desc');
        break;
      case 'rating':
        baseQuery.orderBy('rating', 'desc');
        break;
      default:
        baseQuery.orderBy('created_at', 'desc');
    }

    const page = filters.page;
    const pageSize = filters.pageSize;

    const [{ count }] = await baseQuery.clone().count({ count: '*' });
    const products = await baseQuery
      .clone()
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .select('*');

    const productIds = products.map((product) => product.id);
    const categories = await db('product_categories')
      .leftJoin('categories', 'product_categories.category_id', 'categories.id')
      .whereIn('product_categories.product_id', productIds)
      .select('product_categories.product_id', 'categories.id as category_id', 'categories.name');

    const categoryMap = categories.reduce((acc, row) => {
      if (!acc[row.product_id]) acc[row.product_id] = [];
      if (row.category_id) {
        acc[row.product_id].push({ id: row.category_id, name: row.name });
      }
      return acc;
    }, {});

    const response = {
      pagination: {
        page,
        pageSize,
        total: Number(count ?? 0),
        totalPages: Math.ceil(Number(count ?? 0) / pageSize)
      },
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: Number(product.price),
        compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
        imageUrl: product.image_url,
        inventory: product.inventory,
        rating: Number(product.rating ?? 4.8),
        reviews: Number(product.reviews ?? 0),
        badges: product.badges ?? [],
        categories: categoryMap[product.id] ?? []
      }))
    };

    cache.set(cacheKey, response);
    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const db = getDb();
    const cache = getCache();
    const cacheKey = 'product-categories';
    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    const categories = await db('categories').select('*').orderBy('name', 'asc');
    const payload =
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description
      }));

    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.post('/categories', requireAuth({ allowedRoles: ['admin'] }), async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      slug: z.string().min(2),
      description: z.string().optional()
    });
    const payload = schema.parse(req.body);
    const db = getDb();
    const cache = getCache();
    const [category] = await db('categories')
      .insert({
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null
      })
      .returning('*');
    cache.delete('product-categories');
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', optionalAuth(), async (req, res, next) => {
  try {
    const db = getDb();
    const cache = getCache();
    const cacheKey = `product:${req.params.id}`;

    if (cache.has(cacheKey)) {
      return res.json(cache.get(cacheKey));
    }

    const product = await db('products').where({ id: req.params.id }).first();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const categories = await db('product_categories')
      .leftJoin('categories', 'product_categories.category_id', 'categories.id')
      .where('product_categories.product_id', product.id)
      .select('categories.id', 'categories.name');

    const reviews = await db('product_reviews')
      .leftJoin('customers', 'product_reviews.customer_id', 'customers.id')
      .where('product_reviews.product_id', product.id)
      .andWhere('product_reviews.is_published', true)
      .orderBy('product_reviews.created_at', 'desc')
      .select(
        'product_reviews.id',
        'product_reviews.rating',
        'product_reviews.title',
        'product_reviews.body',
        'product_reviews.created_at',
        'customers.name as customer_name'
      );

    const recommendations = await db('products')
      .whereIn('id', function () {
        this.select('product_id')
          .from('product_categories')
          .whereIn('category_id', function () {
            this.select('category_id')
              .from('product_categories')
              .where('product_id', product.id);
          });
      })
      .andWhereNot('id', product.id)
      .limit(4)
      .select('id', 'name', 'price', 'image_url');

    const payload = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
      imageUrl: product.image_url,
      inventory: product.inventory,
      rating: Number(product.rating ?? 4.8),
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        createdAt: review.created_at,
        customerName: review.customer_name ?? 'Customer'
      })),
      categories,
      related: recommendations.map((recommendation) => ({
        id: recommendation.id,
        name: recommendation.name,
        price: Number(recommendation.price),
        imageUrl: recommendation.image_url
      }))
    };

    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/:id/reviews', async (req, res, next) => {
  try {
    const db = getDb();
    const reviews = await db('product_reviews')
      .leftJoin('customers', 'product_reviews.customer_id', 'customers.id')
      .where('product_reviews.product_id', req.params.id)
      .andWhere('product_reviews.is_published', true)
      .orderBy('product_reviews.created_at', 'desc')
      .select(
        'product_reviews.id',
        'product_reviews.rating',
        'product_reviews.title',
        'product_reviews.body',
        'product_reviews.created_at',
        'customers.name as customer_name'
      );

    res.json(
      reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        body: review.body,
        createdAt: review.created_at,
        customerName: review.customer_name ?? 'Customer'
      }))
    );
  } catch (error) {
    next(error);
  }
});

router.post('/:id/reviews', requireAuth({ allowedRoles: ['customer', 'admin'] }), async (req, res, next) => {
  try {
    const payload = reviewSchema.parse(req.body);
    const db = getDb();
    const cache = getCache();
    const customer = await db('customers')
      .where({ supabase_user_id: req.user.id })
      .first();

    if (!customer) {
      return res.status(400).json({ error: 'Customer profile not found' });
    }

    const [review] = await db('product_reviews')
      .insert({
        product_id: req.params.id,
        customer_id: customer.id,
        rating: payload.rating,
        title: payload.title ?? null,
        body: payload.body
      })
      .returning('*');

    cache.delete(`product:${req.params.id}`);
    res.status(201).json({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      createdAt: review.created_at,
      customerName: customer.name
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requireAuth({ allowedRoles: ['admin'] }), async (req, res, next) => {
  try {
    const payload = createProductSchema.parse(req.body);
    const db = getDb();
    const cache = getCache();

    const [product] = await db('products')
      .insert({
        name: payload.name,
        description: payload.description ?? null,
        price: payload.price,
        compare_at_price: payload.compareAtPrice ?? null,
        image_url: payload.imageUrl,
        inventory: payload.inventory,
        is_active: payload.isActive
      })
      .returning('*');

    if (payload.categories.length > 0) {
      await db('product_categories').insert(
        payload.categories.map((categoryId) => ({
          product_id: product.id,
          category_id: categoryId
        }))
      );
    }

    cache.clear();
    res.status(201).json({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      compareAtPrice: product.compare_at_price ? Number(product.compare_at_price) : null,
      imageUrl: product.image_url,
      inventory: product.inventory,
      isActive: product.is_active
    });
  } catch (error) {
    next(error);
  }
});

export default router;
