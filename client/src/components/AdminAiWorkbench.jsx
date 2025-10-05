import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import aiClient from '../api/aiClient.js';

function useAiAction(path) {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await aiClient.post(path, payload);
      return response.data;
    }
  });
}

export default function AdminAiWorkbench() {
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 18,
    category: 'bath-bombs',
    tone: 'playful luxury',
    seasonal_focus: '',
    ingredients: ''
  });
  const [codeInstruction, setCodeInstruction] = useState('');
  const [codeContext, setCodeContext] = useState('client/src/pages/AdminPage.jsx');
  const [season, setSeason] = useState('Winter Reverie');
  const [metrics, setMetrics] = useState('{"conversion": 2.3, "avgOrderValue": 46.5}');
  const [metricsError, setMetricsError] = useState(null);

  const productAssistant = useAiAction('/ai/products/generate');
  const seasonalAssistant = useAiAction('/ai/products/seasonal');
  const codeAssistant = useAiAction('/ai/code/assistant');
  const optimizationAssistant = useAiAction('/ai/optimizations');

  function handleProductSubmit(event) {
    event.preventDefault();
    const payload = {
      ...productForm,
      price: Number(productForm.price) || 0,
      ingredients: productForm.ingredients
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    };
    productAssistant.mutate(payload);
  }

  function handleSeasonalSubmit(event) {
    event.preventDefault();
    seasonalAssistant.mutate({
      season,
      inventory_snapshot: [],
      preferences: 'Blend botanicals with current hero products'
    });
  }

  function handleCodeSubmit(event) {
    event.preventDefault();
    codeAssistant.mutate({ instruction: codeInstruction, context: codeContext });
  }

  function handleOptimizationSubmit(event) {
    event.preventDefault();
    let parsed = {};
    try {
      parsed = JSON.parse(metrics);
    } catch (error) {
      setMetricsError('Metrics must be valid JSON before sending to the AI service.');
      optimizationAssistant.reset();
      return;
    }
    setMetricsError(null);
    optimizationAssistant.mutate({ metrics: parsed, goals: 'Improve conversion and load time' });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal">AI product copy & launch kit</h2>
          <span className="text-xs uppercase tracking-wide text-gray-400">OpenAI Codex</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Upload new products faster with AI-generated SEO copy, highlights, and launch campaigns.
        </p>

        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleProductSubmit}>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="product-name">
                Product name
              </label>
              <input
                id="product-name"
                type="text"
                value={productForm.name}
                onChange={(event) => setProductForm((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="product-desc">
                Description
              </label>
              <textarea
                id="product-desc"
                value={productForm.description}
                onChange={(event) => setProductForm((prev) => ({ ...prev, description: event.target.value }))}
                className="h-24 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="product-price">
                  Price (USD)
                </label>
                <input
                  id="product-price"
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, price: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="product-category">
                  Category
                </label>
                <input
                  id="product-category"
                  type="text"
                  value={productForm.category}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="product-ingredients">
                Ingredients (comma separated)
              </label>
              <input
                id="product-ingredients"
                type="text"
                value={productForm.ingredients}
                onChange={(event) => setProductForm((prev) => ({ ...prev, ingredients: event.target.value }))}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="product-tone">
                  Tone of voice
                </label>
                <input
                  id="product-tone"
                  type="text"
                  value={productForm.tone}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, tone: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500" htmlFor="product-season">
                  Seasonal focus
                </label>
                <input
                  id="product-season"
                  type="text"
                  value={productForm.seasonal_focus}
                  onChange={(event) => setProductForm((prev) => ({ ...prev, seasonal_focus: event.target.value }))}
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={productAssistant.isPending}
              className="w-full rounded-2xl bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a696dd] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {productAssistant.isPending ? 'Generating…' : 'Generate launch kit'}
            </button>
            {productAssistant.isError ? (
              <p className="text-xs text-red-500">{productAssistant.error?.message || 'Unable to reach the AI service'}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border border-dashed border-lavender/40 bg-lavender/5 p-4 text-sm">
            {productAssistant.data ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">SEO title</p>
                  <p className="font-medium text-charcoal">{productAssistant.data.product?.seo_title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Description</p>
                  <p className="text-gray-600">{productAssistant.data.product?.seo_description}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Highlights</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-gray-600">
                    {(productAssistant.data.product?.highlights || []).map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Promotions</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-gray-600">
                    {(productAssistant.data.assets?.promotions || []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                <p className="text-sm font-medium">Awaiting brief</p>
                <p className="mt-1 text-xs">Fill in the form to generate copy, tags, and campaign ideas.</p>
              </div>
            )}
          </div>
        </form>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal">Seasonal curator</h2>
            <span className="text-xs uppercase tracking-wide text-gray-400">Collections</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Generate seasonal look & feel guidance and campaign messaging.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleSeasonalSubmit}>
            <input
              type="text"
              value={season}
              onChange={(event) => setSeason(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
            />
            <button
              type="submit"
              disabled={seasonalAssistant.isPending}
              className="w-full rounded-2xl bg-mint px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6FA897] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {seasonalAssistant.isPending ? 'Curating…' : 'Plan seasonal refresh'}
            </button>
            {seasonalAssistant.isError ? (
              <p className="text-xs text-red-500">{seasonalAssistant.error?.message || 'Seasonal curator unavailable'}</p>
            ) : null}
          </form>
          <div className="mt-4 rounded-2xl border border-dashed border-mint/40 bg-mint/5 p-4 text-sm text-gray-700">
            {seasonalAssistant.data ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Theme</p>
                <p className="font-medium text-charcoal">{seasonalAssistant.data.theme}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hero copy</p>
                <p>{seasonalAssistant.data.hero_copy}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Marketing ideas</p>
                <ul className="mt-1 list-disc space-y-1 pl-4">
                  {(seasonalAssistant.data.marketing_copy || []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No seasonal plan generated yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-charcoal">Code assistant</h2>
            <span className="text-xs uppercase tracking-wide text-gray-400">Engineering</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Ask the AI to prepare pull requests. Review the diff before approving deployment.
          </p>
          <form className="mt-4 space-y-3" onSubmit={handleCodeSubmit}>
            <textarea
              value={codeInstruction}
              onChange={(event) => setCodeInstruction(event.target.value)}
              placeholder="Describe the change you need…"
              className="h-28 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-lavender focus:outline-none"
              required
            />
            <input
              type="text"
              value={codeContext}
              onChange={(event) => setCodeContext(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-lavender focus:outline-none"
            />
            <button
              type="submit"
              disabled={codeAssistant.isPending}
              className="w-full rounded-2xl bg-charcoal px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
            >
              {codeAssistant.isPending ? 'Drafting…' : 'Generate code update'}
            </button>
            {codeAssistant.isError ? (
              <p className="text-xs text-red-500">{codeAssistant.error?.message || 'Code assistant unavailable'}</p>
            ) : null}
          </form>
          <div className="mt-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs">
            {codeAssistant.data ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Summary</p>
                <p className="text-gray-700">{codeAssistant.data.summary}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Proposed diff</p>
                <pre className="max-h-48 overflow-auto rounded-xl bg-black/90 p-3 font-mono text-[11px] text-emerald-200">
                  {codeAssistant.data.diff || '// No diff returned'}
                </pre>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Testing plan</p>
                <p className="text-gray-700">{codeAssistant.data.testing_plan}</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Awaiting instruction. Generated diffs will appear here for approval.</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-charcoal">Optimization radar</h2>
          <span className="text-xs uppercase tracking-wide text-gray-400">Performance</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Paste Lighthouse, Supabase, or analytics metrics to receive AI-driven optimization ideas.
        </p>
        <form className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]" onSubmit={handleOptimizationSubmit}>
          <textarea
            value={metrics}
            onChange={(event) => setMetrics(event.target.value)}
            className="h-32 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-lavender focus:outline-none"
          />
          <button
            type="submit"
            disabled={optimizationAssistant.isPending}
            className="h-32 w-full rounded-2xl bg-lavender px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a696dd] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {optimizationAssistant.isPending ? 'Analyzing…' : 'Get recommendations'}
          </button>
        </form>
        {metricsError ? <p className="mt-2 text-xs text-red-500">{metricsError}</p> : null}
        {optimizationAssistant.isError ? (
          <p className="mt-2 text-xs text-red-500">
            {optimizationAssistant.error?.message || 'Optimization engine unavailable'}
          </p>
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(optimizationAssistant.data?.suggestions || []).map((suggestion) => (
            <article key={suggestion.title} className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm">
              <h3 className="font-semibold text-charcoal">{suggestion.title}</h3>
              <p className="mt-1 text-gray-600">{suggestion.description}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                <span className="rounded-full bg-white px-2 py-1">Impact: {suggestion.impact}</span>
                <span className="rounded-full bg-white px-2 py-1">Priority: {suggestion.priority}</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">{suggestion.implementation_outline}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
