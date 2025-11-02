/**
 * StaggeredFadeIn Component
 * Animates children one by one with staggered fade-in effect
 */

import React, { useEffect, useState } from 'react';

interface StaggeredFadeInProps {
  children: React.ReactNode[];
  delay?: number; // Delay between each child in ms
  duration?: number; // Animation duration in ms
  staggerDirection?: 'up' | 'down' | 'left' | 'right';
}

export function StaggeredFadeIn({
  children,
  delay = 100,
  duration = 600,
  staggerDirection = 'up',
}: StaggeredFadeInProps) {
  const [visibleIndices, setVisibleIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < React.Children.count(children)) {
        setVisibleIndices((prev) => new Set([...prev, currentIndex]));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, delay);

    return () => clearInterval(interval);
  }, [children, delay]);

  const getInitialTransform = (index: number) => {
    const offset = 20;
    switch (staggerDirection) {
      case 'up':
        return `translateY(${offset}px)`;
      case 'down':
        return `translateY(-${offset}px)`;
      case 'left':
        return `translateX(${offset}px)`;
      case 'right':
        return `translateX(-${offset}px)`;
      default:
        return 'translateY(20px)';
    }
  };

  return (
    <>
      {React.Children.map(children, (child, index) => (
        <div
          key={index}
          style={{
            opacity: visibleIndices.has(index) ? 1 : 0,
            transform: visibleIndices.has(index) ? 'translate(0)' : getInitialTransform(index),
            transition: `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`,
            willChange: 'opacity, transform',
          }}
        >
          {child}
        </div>
      ))}
    </>
  );
}
