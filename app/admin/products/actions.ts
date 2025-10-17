'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createProduct, deleteProduct, updateProduct } from '@/lib/data/products';

const baseSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  inventory: z.coerce.number().int().nonnegative(),
  category: z.string().min(1),
  season: z.enum(['spring', 'summer', 'fall', 'winter', 'holiday']),
  shortDescription: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  tags: z.string().optional(),
});

type ActionState = { success?: boolean; error?: string };

export async function createProductAction(_: unknown, formData: FormData): Promise<ActionState> {
  const parsed = baseSchema.safeParse({
    name: formData.get('name'),
    sku: formData.get('sku'),
    price: formData.get('price'),
    inventory: formData.get('inventory'),
    category: formData.get('category'),
    season: formData.get('season'),
    shortDescription: formData.get('shortDescription'),
    description: formData.get('description'),
    image: formData.get('image'),
    tags: formData.get('tags'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid product input' };
  }

  await createProduct({
    ...parsed.data,
    images: [parsed.data.image],
    tags: parsed.data.tags ? parsed.data.tags.split(',').map((tag) => tag.trim()) : [],
    collections: [],
    benefits: [],
    fragranceNotes: [],
    rating: 5,
    reviewCount: 0,
  });

  revalidatePath('/admin/products');
  return { success: true };
}

export async function deleteProductAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  if (!id || typeof id !== 'string') {
    throw new Error('Missing product id');
  }

  await deleteProduct(id);
  revalidatePath('/admin/products');
}

export async function updateInventoryAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  const inventory = Number(formData.get('inventory'));
  if (!id || typeof id !== 'string' || Number.isNaN(inventory)) {
    throw new Error('Invalid inventory update');
  }

  await updateProduct(id, { inventory });
  revalidatePath('/admin/products');
}
