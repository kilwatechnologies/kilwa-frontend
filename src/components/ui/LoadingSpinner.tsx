import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
      sizes[size],
      className
    )} />
  );
}

export function LoadingCard({ title, description }: { title?: string; description?: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-md">
      <div className="flex flex-col items-center justify-center py-8">
        <LoadingSpinner size="lg" />
        {title && (
          <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
        )}
        {description && (
          <p className="mt-2 text-sm text-gray-600 text-center">{description}</p>
        )}
      </div>
    </div>
  );
}