import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Wand2 } from 'lucide-react';
import { useCustomizationStore, buildCustomProduct } from '../store/customizationStore.js';
import { useCart } from '../context/CartContext.jsx';

const paletteLookup = {
  calm: {
    background: 'from-[#d7cff5] via-white to-[#c6efe0]',
    accent: 'text-[#6556B8]'
  },
  energised: {
    background: 'from-[#ffe9c7] via-white to-[#ffd0c7]',
    accent: 'text-[#D77035]'
  },
  romantic: {
    background: 'from-[#ffdbe8] via-white to-[#f3d2f0]',
    accent: 'text-[#B23A74]'
  },
  grounded: {
    background: 'from-[#d6f0ff] via-white to-[#c7e0ff]',
    accent: 'text-[#26638D]'
  }
};

function OptionCard({ active, title, description, onSelect, children }) {
  return (
    <motion.button
      type="button"
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`flex w-full flex-col gap-2 rounded-2xl border p-4 text-left transition-colors ${
        active ? 'border-lavender bg-lavender/10 shadow-lg' : 'border-gray-200 hover:border-lavender/60'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-charcoal">{title}</p>
          {description ? <p className="text-xs text-gray-500">{description}</p> : null}
        </div>
        <AnimatePresence>
          {active ? (
            <motion.span
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-lavender"
            >
              <CheckCircle2 className="h-5 w-5" />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      {children}
    </motion.button>
  );
}

export default function CustomizePage() {
  const {
    baseOptions,
    scentOptions,
    topperOptions,
    ritualIntents,
    selection,
    setBase,
    setScent,
    toggleTopper,
    setIntent,
    setIntensity,
    reset
  } = useCustomizationStore();
  const { dispatch } = useCart();

  const mood = useMemo(() => {
    const scent = scentOptions.find((option) => option.id === selection.scentId);
    const intent = ritualIntents.find((option) => option.id === selection.intentId);
    return paletteLookup[intent?.palette ?? scent?.tone ?? 'calm'] ?? paletteLookup.calm;
  }, [selection.intentId, selection.scentId, ritualIntents, scentOptions]);

  const product = useMemo(() => buildCustomProduct(selection), [selection]);

  function handleAddToCart() {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrl
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${mood.background} pb-24`}>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-white/40">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Working with bubbles</p>
            <h1 className="text-2xl font-bold text-charcoal">Design your custom ritual</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-lavender hover:text-lavender"
            >
              Start over
            </button>
            <Link
              to="/"
              className="rounded-full bg-charcoal px-4 py-2 text-sm font-semibold text-white hover:bg-charcoal/90"
            >
              Browse collections
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <span className={`rounded-full bg-white/80 p-3 ${mood.accent}`}>
                  <Wand2 className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">Select your base</h2>
                  <p className="text-sm text-gray-500">Each base determines the texture and core benefits of your soak.</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {baseOptions.map((option) => (
                  <OptionCard
                    key={option.id}
                    active={selection.baseId === option.id}
                    title={`${option.name}`}
                    description={`$${option.price.toFixed(2)}`}
                    onSelect={() => setBase(option.id)}
                  >
                    <p className="text-xs text-gray-500">{option.description}</p>
                  </OptionCard>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <span className={`rounded-full bg-white/80 p-3 ${mood.accent}`}>
                  <Sparkles className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-charcoal">Pick your signature scent</h2>
                  <p className="text-sm text-gray-500">
                    Your scent anchors the emotion of the ritual. Adjust the intensity to match the moment.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {scentOptions.map((option) => (
                  <OptionCard
                    key={option.id}
                    active={selection.scentId === option.id}
                    title={option.name}
                    onSelect={() => setScent(option.id)}
                  >
                    <p className="text-xs text-gray-500">Mood: {option.tone}</p>
                  </OptionCard>
                ))}
              </div>

              <label className="mt-6 block">
                <span className="text-sm font-semibold text-gray-600">Fragrance intensity</span>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={selection.intensity}
                  onChange={(event) => setIntensity(event.target.value)}
                  className="mt-2 w-full"
                />
                <p className="text-xs text-gray-500">
                  Currently set to {selection.intensity}%. We’ll calibrate the blend to stay skin-safe and luxurious.
                </p>
              </label>
            </div>

            <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-charcoal">Signature finishing touches</h2>
              <p className="text-sm text-gray-500">Layer textures, shimmer, or aromatherapy oils to elevate the ritual.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {topperOptions.map((option) => {
                  const active = selection.topperIds.includes(option.id);
                  return (
                    <OptionCard
                      key={option.id}
                      active={active}
                      title={option.name}
                      description={`+$${option.price.toFixed(2)}`}
                      onSelect={() => toggleTopper(option.id)}
                    >
                      <p className="text-xs text-gray-500">
                        {active ? 'Tap to remove from your ritual' : 'Tap to include in your blend'}
                      </p>
                    </OptionCard>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-white/80 p-6 shadow-lg">
              <h2 className="text-lg font-semibold text-charcoal">Mood calibration</h2>
              <p className="text-sm text-gray-500">Choose the energy you want this ritual to deliver.</p>
              <div className="mt-4 grid gap-2">
                {ritualIntents.map((intent) => (
                  <OptionCard
                    key={intent.id}
                    active={selection.intentId === intent.id}
                    title={intent.label}
                    onSelect={() => setIntent(intent.id)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-gray-500">Your ritual</p>
                  <h2 className="text-lg font-semibold text-charcoal">{product.name}</h2>
                </div>
                <span className="text-lg font-semibold text-charcoal">${product.price.toFixed(2)}</span>
              </div>
              <p className="mt-3 text-sm text-gray-500">{product.description}</p>

              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>Includes: {selection.topperIds.length ? selection.topperIds.join(', ') : 'base ritual only'}</p>
                <p>Intensity: {selection.intensity}% fragrance load</p>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="mt-6 w-full rounded-full bg-lavender px-6 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-lavender/90"
              >
                Add ritual to cart
              </button>

              <Link
                to="/login"
                className="mt-3 block text-center text-sm font-medium text-lavender hover:underline"
              >
                Sign in to save this ritual
              </Link>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl bg-white/70 p-6 shadow-lg">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-charcoal">Emotion-aware recommendations</h2>
              <p className="text-sm text-gray-500">
                Our AI analyses purchase sentiment to surface rituals that guests loved when seeking a similar vibe.
              </p>
            </div>
            <Link
              to="/"
              className="rounded-full border border-lavender px-4 py-2 text-sm font-semibold text-lavender hover:bg-lavender/10"
            >
              Explore curated sets
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
