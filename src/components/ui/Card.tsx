import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  padding = 'md'
}: CardProps) {
  const baseClasses = 'bg-white rounded-lg shadow';
  const paddingClass = paddingClasses[padding];

  return (
    <div className={`${baseClasses} ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}
