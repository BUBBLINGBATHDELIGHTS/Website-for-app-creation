import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

/**
 * Client components can subscribe to the custom `telemetry` event to hydrate dashboards or feature flags:
 *
 * ```ts
 * useEffect(() => {
 *   function handle(event: CustomEvent<{ event: string; properties: Record<string, unknown> }>) {
 *     console.debug('Telemetry received', event.detail);
 *   }
 *   window.addEventListener('telemetry', handle as EventListener);
 *   return () => window.removeEventListener('telemetry', handle as EventListener);
 * }, []);
 * ```
 *
 * Pair this listener with the data sync orchestrator: fire `track('metrics.refresh', { path })` after revalidating
 * Supabase views or Redis caches so that dashboards and edge functions stay harmonised.
 */

const tempoEndpoint =
  process.env.NEXT_PUBLIC_OTEL_EXPORTER_OTLP_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://tempo:4318/v1/traces';

let telemetryInit: Promise<void> | null = null;
const cacheTimers = new Map<string, ReturnType<typeof setTimeout>>();

function initializeTelemetry() {
  if (telemetryInit) {
    return telemetryInit;
  }

  telemetryInit = (async () => {
    if (typeof window === 'undefined') {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.INFO);
      const [{ NodeTracerProvider }, { BatchSpanProcessor }, { Resource }, { SemanticResourceAttributes }, { OTLPTraceExporter }] =
        await Promise.all([
          import('@opentelemetry/sdk-trace-node'),
          import('@opentelemetry/sdk-trace-base'),
          import('@opentelemetry/resources'),
          import('@opentelemetry/semantic-conventions'),
          import('@opentelemetry/exporter-trace-otlp-http'),
        ]);

      const provider = new NodeTracerProvider({
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: 'bubblingbathdelights-web',
          [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'development',
        }),
      });

      const exporter = new OTLPTraceExporter({ url: tempoEndpoint });
      provider.addSpanProcessor(new BatchSpanProcessor(exporter));
      provider.register();
      return;
    }

    const [
      { WebTracerProvider },
      { BatchSpanProcessor },
      { Resource },
      { SemanticResourceAttributes },
      { OTLPTraceExporter },
      { registerInstrumentations },
      { FetchInstrumentation },
      { DocumentLoadInstrumentation },
    ] = await Promise.all([
      import('@opentelemetry/sdk-trace-web'),
      import('@opentelemetry/sdk-trace-base'),
      import('@opentelemetry/resources'),
      import('@opentelemetry/semantic-conventions'),
      import('@opentelemetry/exporter-trace-otlp-http'),
      import('@opentelemetry/instrumentation'),
      import('@opentelemetry/instrumentation-fetch'),
      import('@opentelemetry/instrumentation-document-load'),
    ]);

    const provider = new WebTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'bubblingbathdelights-web',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV ?? 'development',
      }),
    });

    const exporter = new OTLPTraceExporter({ url: tempoEndpoint });
    provider.addSpanProcessor(new BatchSpanProcessor(exporter));
    provider.register();

    registerInstrumentations({
      instrumentations: [
        new FetchInstrumentation({ propagateTraceHeaderCorsUrls: /.*/ }),
        new DocumentLoadInstrumentation(),
      ],
    });
  })();

  return telemetryInit;
}

void initializeTelemetry();

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

type CacheHygieneOptions = {
  ttlMs?: number;
  onExpire?: () => void;
};

export function scheduleCacheHygiene(path: string, options: CacheHygieneOptions = {}) {
  const ttlMs = options.ttlMs ?? 5 * 60 * 1000;
  const existing = cacheTimers.get(path);
  if (existing) {
    clearTimeout(existing);
  }

  const timer = setTimeout(() => {
    cacheTimers.delete(path);
    track('cache.hygiene', { path, ttlMs });
    options.onExpire?.();
  }, ttlMs);

  cacheTimers.set(path, timer);

  return () => {
    const active = cacheTimers.get(path);
    if (active) {
      clearTimeout(active);
      cacheTimers.delete(path);
    }
  };
}
