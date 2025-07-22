"use client"

import React from 'react';
import { useThemeDetector } from '@/lib/hooks/use-theme-detector';

interface BoxShadowCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: React.ElementType;
}

export const BoxShadowCard: React.FC<BoxShadowCardProps> = ({ 
  children, 
  className = "", 
  onClick,
  as: Component = 'div',
  ...props
}) => {
  return (
    <Component 
      className={`${useThemeDetector() === 'light' ? 'bg-[#f3e9d2]' : 'bg-[#181c2a]'}
        rounded-2xl
        shadow-[0_0_40px_10px_rgba(59,130,246,0.25)]
        transition-shadow hover:shadow-[0_0_60px_20px_rgba(59,130,246,0.4)]
        ${className}`.trim()}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  );
};

export default BoxShadowCard;