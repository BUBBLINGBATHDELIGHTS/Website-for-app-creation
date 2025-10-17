'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createProductAction } from '@/app/admin/products/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const initialState = { success: false } as { success?: boolean; error?: string };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Creating…' : 'Add product'}
    </Button>
  );
}

export function ProductForm() {
  const [state, formAction] = useFormState(createProductAction, initialState);

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      <Input name="name" placeholder="Name" required className="bg-white/80" />
      <Input name="sku" placeholder="SKU" required className="bg-white/80" />
      <Input name="price" type="number" step="0.01" placeholder="Price" required className="bg-white/80" />
      <Input name="inventory" type="number" placeholder="Inventory" required className="bg-white/80" />
      <Input name="category" placeholder="Category" required className="bg-white/80" />
      <Input name="season" placeholder="Season (spring, summer, fall, winter, holiday)" required className="bg-white/80 md:col-span-2" />
      <Input name="image" placeholder="Primary image URL" required className="bg-white/80 md:col-span-2" />
      <Input name="tags" placeholder="Tags (comma separated)" className="bg-white/80 md:col-span-2" />
      <Input name="shortDescription" placeholder="Short description" required className="bg-white/80 md:col-span-2" />
      <textarea
        name="description"
        placeholder="Detailed description"
        required
        className="md:col-span-2 min-h-[120px] rounded-3xl border border-[#E5DFF7] bg-white/80 p-4 text-sm text-[#2F1F52] shadow-inner"
      />
      <div className="md:col-span-2 flex items-center gap-3">
        <SubmitButton />
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-emerald-600">Product added</p>}
      </div>
    </form>
  );
}
