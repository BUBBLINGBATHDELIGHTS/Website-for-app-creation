const intents = [
  {
    keywords: ['shipping', 'delivery', 'arrive'],
    response:
      'Orders approved before 5pm ship the same day via USPS. Expedited deliveries arrive in 2 business days across the US.',
  },
  {
    keywords: ['discount', 'loyalty', 'rewards'],
    response:
      'Create an account to unlock the 10% loyalty welcome gift. Members earn 5-15% back in ritual rewards every time.',
  },
  {
    keywords: ['recommend', 'suggest', 'gift'],
    response:
      'Tell me who you are shopping for and I will build a sensory profile from our Aurora recommendation engine.',
  },
];

export function getChatbotReply(message: string) {
  const lower = message.toLowerCase();
  const match = intents.find((intent) => intent.keywords.some((keyword) => lower.includes(keyword)));
  if (match) {
    return match.response;
  }

  return 'I am here to craft the perfect ritual. Ask about ingredients, shipping, or personalised pairings and I will guide you.';
}
