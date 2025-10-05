import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-3xl border border-[#E5DFF7] bg-white/80 px-5 py-4 text-sm text-[#2F1F52] shadow-inner placeholder:text-[#8C7BAF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB9A7] focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';
