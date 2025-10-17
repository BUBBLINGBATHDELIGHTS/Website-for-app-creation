'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '@/app/(auth)/login/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const initialState = { error: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" size="lg" disabled={pending}>
      {pending ? 'Authenticating…' : 'Enter workspace'}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="bg-white/80" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required className="bg-white/80" />
      </div>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-[#4F3C75]">Workspace</legend>
        <div className="grid gap-2 md:grid-cols-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
            <input
              type="radio"
              name="workspace"
              value="admin"
              defaultChecked
            />
            <div>
              <p className="text-sm font-semibold text-[#2F1F52]">Admin</p>
              <p className="text-xs text-[#4F3C75]">Product, order, and loyalty controls.</p>
            </div>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-white/60 bg-white/70 p-4 shadow-sm">
            <input type="radio" name="workspace" value="employee" />
            <div>
              <p className="text-sm font-semibold text-[#2F1F52]">Employee</p>
              <p className="text-xs text-[#4F3C75]">Fulfilment inbox, concierge requests.</p>
            </div>
          </label>
        </div>
      </fieldset>
      {state?.error && <p className="rounded-2xl bg-red-50/60 p-3 text-sm font-medium text-red-700">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
