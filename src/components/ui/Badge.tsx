import { clsx, type ClassValue } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'green' | 'red' | 'amber' | 'blue';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-800 text-gray-300 border-gray-700',
    green: 'bg-green-900/30 text-green-400 border-green-800',
    red: 'bg-red-900/30 text-red-400 border-red-800',
    amber: 'bg-amber-900/30 text-amber-400 border-amber-800',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-800',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded text-xs font-mono border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
