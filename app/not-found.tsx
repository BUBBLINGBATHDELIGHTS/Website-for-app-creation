import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="space-y-6 text-center">
      <h1 className="font-display text-4xl text-[#2F1F52]">The bubbles drifted away</h1>
      <p className="text-sm text-[#4F3C75]">We couldn’t find that page. Let’s guide you back to calm waters.</p>
      <Button asChild>
        <Link href="/">Return home</Link>
      </Button>
    </div>
  );
}
