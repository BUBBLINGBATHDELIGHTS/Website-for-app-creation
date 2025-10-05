import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login · Bubbling Bath Delights',
};

export default function LoginPage() {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Choose your workspace and authenticate with your decentralised identity.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#4F3C75]">Email or DID</label>
            <Input placeholder="you@bubblingbathdelights.com" required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#4F3C75]">Magic phrase</label>
            <Input type="password" placeholder="••••••••" required />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">
              Enter admin sanctuary
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Employee realm
            </Button>
          </div>
        </form>
        <p className="text-xs text-[#4F3C75]/70">
          Register authorised emails via the Working with Bubbles invite desk. Self-sovereign credentials supported in the
          next milestone.
        </p>
      </CardContent>
    </Card>
  );
}
