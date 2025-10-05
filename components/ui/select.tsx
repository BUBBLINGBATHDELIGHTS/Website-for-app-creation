import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-11 w-full rounded-full border border-[#E5DFF7] bg-white/80 px-4 text-sm text-[#2F1F52] shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7FB9A7] focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
