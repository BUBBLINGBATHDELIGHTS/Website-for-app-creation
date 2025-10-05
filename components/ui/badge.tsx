import { cn } from '@/lib/utils/cn';

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline' | 'success';
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
        variant === 'default' && 'bg-[#B8A8EA]/80 text-[#2F1F52]',
        variant === 'outline' && 'border border-[#B8A8EA]/40 text-[#2F1F52]/80',
        variant === 'success' && 'bg-[#7FB9A7]/80 text-white',
        className,
      )}
      {...props}
    />
  );
}
