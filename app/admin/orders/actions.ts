'use server';

import { revalidatePath } from 'next/cache';
import { approveOrder, denyOrder } from '@/lib/data/orders';

export async function approveOrderAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  if (!id || typeof id !== 'string') {
    throw new Error('Missing order id');
  }

  await approveOrder(id);
  revalidatePath('/admin/orders');
}

export async function denyOrderAction(formData: FormData): Promise<void> {
  const id = formData.get('id');
  const reason = formData.get('reason');
  if (!id || typeof id !== 'string' || !reason || typeof reason !== 'string') {
    throw new Error('Missing reason');
  }

  await denyOrder(id, reason);
  revalidatePath('/admin/orders');
}
