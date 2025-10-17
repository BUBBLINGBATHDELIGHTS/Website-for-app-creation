'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { authenticateUser, clearSessionCookie, setSessionCookie } from '@/lib/utils/auth';

const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  workspace: z.enum(['admin', 'employee'], { required_error: 'Choose a workspace' }),
});

type LoginState = {
  error?: string;
};

export async function loginAction(_: LoginState | undefined, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    workspace: formData.get('workspace'),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Invalid input' };
  }

  const user = await authenticateUser(parsed.data.email, parsed.data.password, parsed.data.workspace);
  if (!user) {
    return { error: 'Unable to authenticate with provided credentials' };
  }

  setSessionCookie({ ...user, issuedAt: Math.floor(Date.now() / 1000) });

  redirect(parsed.data.workspace === 'admin' ? '/admin' : '/employee');
}

export async function logoutAction() {
  clearSessionCookie();
  redirect('/');
}
