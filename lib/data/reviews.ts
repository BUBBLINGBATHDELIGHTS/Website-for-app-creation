import { z } from 'zod';
import { mutateJsonFile, readJsonFile } from './fs-store';

const REVIEWS_FILE = 'reviews.json';

export const reviewSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  customerName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1),
  body: z.string().min(10),
  createdAt: z.string().default(() => new Date().toISOString()),
  photos: z.array(z.string()).default([]),
});

export type Review = z.infer<typeof reviewSchema>;

const reviewInputSchema = reviewSchema.omit({ id: true, createdAt: true });
export type ReviewInput = z.infer<typeof reviewInputSchema>;

async function readReviews() {
  return readJsonFile<Review[]>(REVIEWS_FILE, []);
}

export async function listReviewsForProduct(productId: string) {
  const reviews = await readReviews();
  return reviews.filter((review) => review.productId === productId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createReview(input: ReviewInput) {
  const parsed = reviewInputSchema.parse(input);
  const review: Review = {
    ...parsed,
    id: `REV-${Math.floor(Math.random() * 9000 + 1000)}`,
    createdAt: new Date().toISOString(),
  };

  await mutateJsonFile<Review[]>(REVIEWS_FILE, (reviews) => [...reviews, review], []);
  return review;
}
