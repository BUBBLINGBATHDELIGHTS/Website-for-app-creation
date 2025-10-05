'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/shared/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { track } from '@/lib/utils/observability';

async function generateContent(prompt: string) {
  const response = await fetch('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate content');
  }

  const { result } = await response.json();
  return result as string;
}

export function AIWorkbench() {
  const [prompt, setPrompt] = useState('Draft an enchanting ritual description for our Lavender Orbit bath bomb.');
  const mutation = useMutation({
    mutationFn: generateContent,
    onSuccess: (output) => track('ai.generated', { outputLength: output.length }),
  });

  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>AI Ritual Composer</CardTitle>
        <CardDescription>Transform natural language prompts into production-ready product copy.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={4} />
        <Button disabled={mutation.isPending} onClick={() => mutation.mutate(prompt)}>
          {mutation.isPending ? 'Summoning inspiration…' : 'Generate copy'}
        </Button>
        {mutation.data && (
          <div className="rounded-2xl bg-white/70 p-4 text-sm text-[#4F3C75] shadow-inner">
            <p className="whitespace-pre-wrap leading-relaxed">{mutation.data}</p>
          </div>
        )}
        {mutation.error && <p className="text-sm text-rose-500">{(mutation.error as Error).message}</p>}
      </CardContent>
    </Card>
  );
}
