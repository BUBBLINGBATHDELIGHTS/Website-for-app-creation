type ProductCopyInput = {
  name?: string;
  ingredients?: string;
  mood?: string;
  prompt?: string;
};

export async function generateProductDescriptions(productData: ProductCopyInput) {
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

function templateBasedGeneration({ name, ingredients, mood, prompt }: ProductCopyInput) {
  const displayName = formatName(name) ?? 'Your ritual';
  const ingredientLine = formatOptionalLine(ingredients, ' Infused with botanical extracts,');
  const moodLine = formatOptionalLine(mood, ' it wraps you in serene comfort.', (value) => ` it evokes a sense of ${value}.`);
  const promptLine = prompt?.trim()
    ? ` Inspired by the request, we emphasise ${summarisePrompt(prompt)}.`
    : '';

  return `${displayName} is hand-crafted to transform your bathroom into a sanctuary.${ingredientLine}${moodLine}${promptLine} Enjoy complimentary mindfulness prompts within every ritual.`;
}

function formatName(name?: string) {
  if (!name) return null;
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function formatOptionalLine(
  value: string | undefined,
  fallback: string,
  formatter: (value: string) => string = (val) => ` Infused with ${val},`,
) {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return formatter(trimmed);
}

function summarisePrompt(prompt: string) {
  const cleaned = prompt.trim();
  if (cleaned.length <= 120) {
    return cleaned;
  }
  return `${cleaned.slice(0, 117)}...`;
}
