import { cn } from '@/lib/utils/cn';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'destructive' | 'secondary';
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variant === 'default' && 'bg-blush-300/80 text-purple-900',
        variant === 'outline' && 'border border-blush-300/40 text-purple-900/80',
        variant === 'success' && 'bg-eucalyptus-400/80 text-white',
        variant === 'warning' && 'bg-amber-300/80 text-amber-900',
        variant === 'destructive' && 'bg-rose-400/90 text-white',
        variant === 'secondary' && 'bg-purple-100 text-purple-700',
        className,
      )}
      {...props}
    />
  );
}
