export async function generateProductDescriptions(productData: { name: string; ingredients?: string; mood?: string }) {
  if (typeof window !== 'undefined' && 'ai' in window) {
    const win = window as typeof window & {
      ai?: {
        textGenerator?: {
          generate: (input: unknown) => Promise<string>;
        };
      };
    };

    if (win.ai?.textGenerator?.generate) {
      return win.ai.textGenerator.generate(productData);
    }
  }

  return templateBasedGeneration(productData);
}

function templateBasedGeneration(productData: { name: string; ingredients?: string; mood?: string }) {
  const { name, ingredients, mood } = productData;
  const base = `${name} is hand-crafted to transform your bathroom into a sanctuary.`;
  const ingredientLine = ingredients ? ` Infused with ${ingredients},` : ' Infused with botanical extracts,';
  const moodLine = mood ? ` it evokes a sense of ${mood}.` : ' it wraps you in serene comfort.';
  return `${base}${ingredientLine}${moodLine} Enjoy complimentary mindfulness prompts within every ritual.`;
}
