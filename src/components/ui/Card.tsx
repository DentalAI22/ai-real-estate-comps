import React from 'react';
import { classNames } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  padding?: CardPadding;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  padding = 'md',
  className,
  hover = true,
  onClick,
}: CardProps) {
  return (
    <div
      className={classNames(
        'bg-white rounded-xl shadow-sm border border-gray-100 transition-shadow duration-200',
        hover && 'hover:shadow-md',
        paddingClasses[padding],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
}
