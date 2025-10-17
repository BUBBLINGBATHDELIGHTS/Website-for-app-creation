import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(function Label(
  { className, ...props },
  ref,
) {
  return (
    <label
      ref={ref}
      className={cn('text-sm font-semibold text-[#2F1F52]', className)}
      {...props}
    />
  );
});
