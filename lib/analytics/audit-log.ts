import { createClient } from '@/lib/supabase/server-client';

export type AgentAction = {
  actor: string;
  action: string;
  metadata?: Record<string, unknown>;
};

/**
 * TODO: replace with Supabase table `agent_actions` once migrations land. The helper gives future callers a typed entry point.
 */
export async function recordAgentAction(entry: AgentAction) {
  try {
    const client = createClient();
    const { error } = await client.from('agent_actions').insert({
      actor: entry.actor,
      action: entry.action,
      metadata: entry.metadata ?? {},
    });
    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn('Failed to record agent action. Ensure agent_actions table exists.', error);
  }
}
