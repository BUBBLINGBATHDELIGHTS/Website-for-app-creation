import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

if (typeof window === 'undefined') {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
}

export function track(event: string, properties: Record<string, unknown> = {}) {
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.info('[telemetry]', event, properties);
    return;
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('telemetry', { detail: { event, properties } }));
  } else {
    console.info('[telemetry]', event, properties);
  }
}
