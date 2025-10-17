'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitReview } from '@/app/shop/products/[id]/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/shared/textarea';

const initialState = { success: false } as { success?: boolean; error?: string };

type Review = {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

type ProductReviewsProps = {
  productId: string;
  reviews: Review[];
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Sharing reflection…' : 'Submit review'}
    </Button>
  );
}

export function ProductReviews({ productId, reviews }: ProductReviewsProps) {
  const [state, formAction] = useFormState(submitReview, initialState);

  return (
    <div className="grid gap-8 md:grid-cols-[1.2fr_1fr]">
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-sm text-[#4F3C75]">No reflections yet—be the first to share your ritual.</p>}
        {reviews.map((review) => (
          <article key={review.id} className="rounded-3xl bg-white/70 p-5 shadow-inner">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-[#2F1F52]">{review.customerName}</p>
              <span className="text-sm text-[#8C7BAF]">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-[#4F3C75]">{review.title}</p>
            <p className="mt-2 text-sm text-[#4F3C75]">{review.body}</p>
          </article>
        ))}
      </div>
      <form action={formAction} className="space-y-4 rounded-3xl bg-white/70 p-6 shadow">
        <input type="hidden" name="productId" value={productId} />
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2F1F52]" htmlFor="customerName">
            Name
          </label>
          <Input id="customerName" name="customerName" required className="bg-white/80" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2F1F52]" htmlFor="rating">
            Rating
          </label>
          <Input id="rating" name="rating" type="number" min={1} max={5} step={1} required className="bg-white/80" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2F1F52]" htmlFor="title">
            Headline
          </label>
          <Input id="title" name="title" required className="bg-white/80" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#2F1F52]" htmlFor="body">
            Story
          </label>
          <Textarea id="body" name="body" rows={4} required className="bg-white/80" />
        </div>
        {state?.error && <p className="rounded-2xl bg-red-50/60 p-2 text-sm text-red-700">{state.error}</p>}
        {state?.success && <p className="rounded-2xl bg-emerald-50/60 p-2 text-sm text-emerald-700">Thank you for your reflection!</p>}
        <SubmitButton />
      </form>
    </div>
  );
}
