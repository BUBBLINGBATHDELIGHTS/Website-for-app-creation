import * as React from 'react';
import { cn } from '@/lib/utils/cn';

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-3xl border border-blush-200 bg-white/80 px-5 py-4 text-sm text-purple-900 shadow-inner placeholder:text-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus-300 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
