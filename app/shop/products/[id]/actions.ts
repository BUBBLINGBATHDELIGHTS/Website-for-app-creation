'use server';

import { z } from 'zod';
import { createReview } from '@/lib/data/reviews';
import { revalidatePath } from 'next/cache';

const reviewSchema = z.object({
  productId: z.string().min(1),
  customerName: z.string().min(1),
  rating: z.coerce.number().min(1).max(5),
  title: z.string().min(3),
  body: z.string().min(20),
});

type ReviewState = {
  error?: string;
  success?: boolean;
};

export async function submitReview(_: ReviewState | undefined, formData: FormData): Promise<ReviewState> {
  const parsed = reviewSchema.safeParse({
    productId: formData.get('productId'),
    customerName: formData.get('customerName'),
    rating: formData.get('rating'),
    title: formData.get('title'),
    body: formData.get('body'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Review could not be submitted' };
  }

  await createReview({ ...parsed.data, photos: [] });
  revalidatePath(`/shop/products/${parsed.data.productId}`);

  return { success: true };
}
