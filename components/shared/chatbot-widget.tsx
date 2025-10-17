'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getChatbotReply } from '@/lib/ai/chatbot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ author: 'user' | 'bot'; content: string }[]>([
    {
      author: 'bot',
      content: 'Hello luminous soul ✨ How can I elevate your ritual today?',
    },
  ]);
  const [input, setInput] = useState('');

  function sendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim()) return;
    const userMessage = { author: 'user' as const, content: input.trim() };
    const botMessage = { author: 'bot' as const, content: getChatbotReply(input) };
    setMessages((previous) => [...previous, userMessage, botMessage]);
    setInput('');
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={() => setIsOpen((value) => !value)}
        className="rounded-full bg-gradient-to-r from-[#B8A8EA] to-[#7FB9A7] px-6 py-3 text-white shadow-xl"
      >
        {isOpen ? 'Close concierge' : 'Need ritual help?'}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="mt-4 w-80 rounded-3xl border border-white/40 bg-gradient-to-br from-white/90 to-white/60 p-4 shadow-2xl backdrop-blur"
          >
            <div className="max-h-80 space-y-3 overflow-y-auto pr-2 text-sm">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={
                    message.author === 'bot'
                      ? 'rounded-2xl bg-[#2F1F52]/90 p-3 text-white shadow'
                      : 'ml-auto max-w-[80%] rounded-2xl bg-[#F2ECFB] p-3 text-[#2F1F52] shadow'
                  }
                >
                  {message.content}
                </div>
              ))}
            </div>
            <form onSubmit={sendMessage} className="mt-3 flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about rituals, shipping…"
                className="bg-white/80"
              />
              <Button type="submit" size="sm">
                Send
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
