import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/shared/login-form';

export const metadata: Metadata = {
  title: 'Login · Bubbling Bath Delights',
};

export default function LoginPage() {
  return (
    <Card className="mx-auto max-w-lg border-white/40 bg-white/70 shadow-2xl backdrop-blur">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-[#2F1F52]">Secure access</CardTitle>
        <CardDescription className="text-[#4F3C75]">
          Sign in with your authorised credentials to enter the admin or employee sanctuary.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
