import { AIWorkbench } from '@/components/admin/ai-workbench';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Workbench · Bubbling Bath Delights',
};

export default function AdminAIWorkbenchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-purple-900">Working with Bubbles</h1>
        <p className="text-sm text-purple-700">
          Natural language prompts orchestrate seasonal refreshes, marketing copy, and engineering guardrails.
        </p>
      </div>
      <AIWorkbench />
    </div>
  );
}
