'use server';

import { revalidatePath } from 'next/cache';
import { updateCustomer } from '@/lib/data/customers';

export async function updateCustomerPointsAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  const points = Number(formData.get('points'));
  if (!id || typeof id !== 'string' || Number.isNaN(points)) {
    throw new Error('Invalid loyalty update');
  }

  await updateCustomer(id, { points });
  revalidatePath('/admin/customers');
}
