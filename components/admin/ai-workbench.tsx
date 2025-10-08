'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/shared/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation } from '@tanstack/react-query';
import { track } from '@/lib/utils/observability';

async function generateContent(prompt: string) {
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate content (status ${response.status})`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('Unexpected response format from AI endpoint');
    }

    const payload = (await response.json()) as { result?: unknown };
    if (typeof payload.result !== 'string') {
      throw new Error('AI response did not include generated text');
    }

    return payload.result;
  } catch (error) {
    if (error instanceof Error) {
      track('ai.generate.error', { message: error.message });
      throw error;
    }

    track('ai.generate.error', { message: 'Unknown error' });
    throw new Error('Unknown error generating content');
  }
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
          <div className="rounded-2xl bg-white/70 p-4 text-sm text-purple-700 shadow-inner">
            <p className="whitespace-pre-wrap leading-relaxed">{mutation.data}</p>
          </div>
        )}
        {mutation.error && <p className="text-sm text-rose-500">{(mutation.error as Error).message}</p>}
      </CardContent>
    </Card>
  );
}
