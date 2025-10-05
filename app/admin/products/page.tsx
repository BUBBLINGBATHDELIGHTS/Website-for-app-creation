import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateProductDescriptions } from '@/lib/ai/local-processing';
import { use } from 'react';

async function getSuggestedCopy() {
  return generateProductDescriptions({ name: 'Rose Quartz Aura', mood: 'calm confidence' });
}

export default function AdminProductsPage() {
  const suggestion = use(getSuggestedCopy());

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-[#2F1F52]">Product orchestration</h1>
        <p className="text-sm text-[#4F3C75]">
          Manage categories, inventory, and promo codes with on-device AI assists.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload new ritual</CardTitle>
          <CardDescription>Codex-inspired assistant suggests descriptions, SEO tags, and promotional content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Product name" defaultValue="Rose Quartz Aura" />
            <Input placeholder="Price" defaultValue="28.00" type="number" step="0.01" />
          </div>
          <Input placeholder="Seasonal tags (comma separated)" defaultValue="winter, aurora, spa" />
          <textarea
            className="min-h-[160px] w-full rounded-3xl border border-[#E5DFF7] bg-white/70 p-4 text-sm text-[#2F1F52] shadow-inner"
            defaultValue={suggestion}
          />
          <div className="flex gap-3">
            <Button>Save to Supabase</Button>
            <Button variant="outline">Preview SEO</Button>
            <Button variant="ghost">Generate campaign</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
