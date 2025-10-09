import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/shared/textarea';
import { generateProductDescriptions } from '@/lib/ai/local-processing';

async function getSuggestedCopy() {
  try {
    return await generateProductDescriptions({ name: 'Rose Quartz Aura', mood: 'calm confidence' });
  } catch (error) {
    console.error('AI suggestion failed', error);
    return 'We could not retrieve AI copy. Please try again or adjust your prompt.';
  }
}

async function saveProductAction(formData: FormData) {
  'use server';
  console.info('TODO: Persist product to Supabase', Object.fromEntries(formData));
}

async function previewSeoAction(formData: FormData) {
  'use server';
  console.info('TODO: Preview SEO metadata', Object.fromEntries(formData));
}

async function generateCampaignAction(formData: FormData) {
  'use server';
  console.info('TODO: Generate campaign assets', Object.fromEntries(formData));
}

function LoadingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading ritual assistant…</CardTitle>
        <CardDescription>Preparing AI-enhanced recommendations.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-purple-700">Fetching inspiration from the local AI helper.</p>
      </CardContent>
    </Card>
  );
}

async function SuggestedCopyCard() {
  const suggestion = await getSuggestedCopy();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload new ritual</CardTitle>
        <CardDescription>Codex-inspired assistant suggests descriptions, SEO tags, and promotional content.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action={saveProductAction} className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Input name="name" placeholder="Product name" defaultValue="Rose Quartz Aura" />
            <Input name="price" placeholder="Price" defaultValue="28.00" type="number" step="0.01" />
          </div>
          <Input name="tags" placeholder="Seasonal tags (comma separated)" defaultValue="winter, aurora, spa" />
          <Textarea
            name="description"
            className="min-h-[160px] w-full rounded-3xl border border-blush-200 bg-white/70 p-4 text-sm text-purple-900 shadow-inner"
            defaultValue={suggestion}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" formAction={saveProductAction}>
              Save to Supabase
            </Button>
            <Button type="submit" variant="outline" formAction={previewSeoAction}>
              Preview SEO
            </Button>
            <Button type="submit" variant="ghost" formAction={generateCampaignAction}>
              Generate campaign
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AdminProductsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-purple-900">Product orchestration</h1>
        <p className="text-sm text-purple-700">Manage categories, inventory, and promo codes with on-device AI assists.</p>
      </div>
      <Suspense fallback={<LoadingCard />}>
        {/* @ts-expect-error Async Server Component */}
        <SuggestedCopyCard />
      </Suspense>
    </div>
  );
}
