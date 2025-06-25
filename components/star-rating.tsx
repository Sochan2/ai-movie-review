"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  max?: number;
  rating: number;
  onChange: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({
  max = 5,
  rating,
  onChange,
  readOnly = false,
  size = 'md',
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const handleMouseOver = (index: number) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };
  
  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(null);
    }
  };
  
  const handleClick = (index: number) => {
    if (!readOnly) {
      onChange(index);
    }
  };
  
  const starSizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };
  
  const currentRating = hoverRating !== null ? hoverRating : rating;
  
  return (
    <div className="flex space-x-1" onMouseLeave={handleMouseLeave}>
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={cn(
              starSizes[size],
              'cursor-pointer transition-all',
              currentRating >= starValue
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground'
            )}
            onMouseOver={() => handleMouseOver(starValue)}
            onClick={() => handleClick(starValue)}
          />
        );
      })}
    </div>
  );
}