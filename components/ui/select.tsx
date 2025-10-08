import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-11 w-full rounded-full border border-blush-200 bg-white/80 px-4 text-sm text-purple-900 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eucalyptus-300 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = 'Select';
