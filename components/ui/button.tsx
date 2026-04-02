import * as React from 'react';

import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'bg-ink text-white hover:bg-ink/90',
        variant === 'secondary' && 'bg-clay text-white hover:bg-clay/90',
        variant === 'ghost' && 'bg-transparent text-ink hover:bg-ink/5',
        className
      )}
      {...props}
    />
  );
});