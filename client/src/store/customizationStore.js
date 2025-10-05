import { create } from 'zustand';

const baseOptions = [
  { id: 'bomb', name: 'Bath Bomb Base', price: 12, description: 'Classic fizz with silky cocoa butter.' },
  { id: 'soak', name: 'Mineral Soak Base', price: 14, description: 'Dead Sea salts infused with skin-softening oils.' },
  { id: 'foam', name: 'Whipped Foam Base', price: 16, description: 'Velvety foam that leaves skin hydrated and calm.' }
];

const scentOptions = [
  { id: 'lavender', name: 'Lavender Dream', tone: 'calm' },
  { id: 'citrus', name: 'Citrus Sunrise', tone: 'energised' },
  { id: 'rose', name: 'Rose Reverie', tone: 'romantic' },
  { id: 'cedar', name: 'Cedar Spa', tone: 'grounded' }
];

const topperOptions = [
  { id: 'petals', name: 'Rose Petals', price: 3 },
  { id: 'glitter', name: 'Biodegradable Shimmer', price: 2 },
  { id: 'oils', name: 'Aromatherapy Oil Booster', price: 4 }
];

const ritualIntents = [
  { id: 'relax', label: 'Relax & Unwind', palette: 'calm' },
  { id: 'focus', label: 'Find Focus', palette: 'energised' },
  { id: 'celebrate', label: 'Celebrate', palette: 'romantic' },
  { id: 'ground', label: 'Feel Grounded', palette: 'grounded' }
];

export const useCustomizationStore = create((set) => ({
  baseOptions,
  scentOptions,
  topperOptions,
  ritualIntents,
  selection: {
    baseId: baseOptions[0].id,
    scentId: scentOptions[0].id,
    topperIds: [topperOptions[0].id],
    intentId: ritualIntents[0].id,
    intensity: 50
  },
  setBase: (baseId) => set((state) => ({ selection: { ...state.selection, baseId } })),
  setScent: (scentId) => set((state) => ({ selection: { ...state.selection, scentId } })),
  toggleTopper: (topperId) =>
    set((state) => {
      const hasTopper = state.selection.topperIds.includes(topperId);
      return {
        selection: {
          ...state.selection,
          topperIds: hasTopper
            ? state.selection.topperIds.filter((id) => id !== topperId)
            : [...state.selection.topperIds, topperId]
        }
      };
    }),
  setIntent: (intentId) => set((state) => ({ selection: { ...state.selection, intentId } })),
  setIntensity: (intensity) =>
    set((state) => ({ selection: { ...state.selection, intensity: Number(intensity) } })),
  reset: () =>
    set({
      selection: {
        baseId: baseOptions[0].id,
        scentId: scentOptions[0].id,
        topperIds: [topperOptions[0].id],
        intentId: ritualIntents[0].id,
        intensity: 50
      }
    })
}));

export function buildCustomProduct(selection) {
  const base = baseOptions.find((option) => option.id === selection.baseId);
  const scent = scentOptions.find((option) => option.id === selection.scentId);
  const toppers = topperOptions.filter((option) => selection.topperIds.includes(option.id));

  const topperPrice = toppers.reduce((sum, option) => sum + option.price, 0);
  const intensityDescriptor =
    selection.intensity < 35 ? 'delicately scented' : selection.intensity > 70 ? 'boldly aromatic' : 'balanced';

  return {
    id: `custom-${selection.baseId}-${selection.scentId}-${selection.intensity}-${selection.topperIds.join('-')}`,
    name: `${base.name} · ${scent.name}`,
    description: `${intensityDescriptor} with ${toppers.map((option) => option.name.toLowerCase()).join(', ')}.`,
    price: base.price + topperPrice,
    imageUrl: '/assets/custom-ritual-placeholder.jpg',
    badges: ['Custom Ritual']
  };
}
