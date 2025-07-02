'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface ScrollToTopProps {
  targetRef?: React.RefObject<HTMLElement | null>;
  className?: string;
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({ targetRef, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = targetRef?.current?.scrollTop || window.scrollY;
      setIsVisible(scrollTop > 300);
    };

    const target = targetRef?.current || window;
    if (target) {
      target.addEventListener('scroll', handleScroll);
      
      return () => {
        target.removeEventListener('scroll', handleScroll);
      };
    }
  }, [targetRef]);

  // 滚动到顶部
  const scrollToTop = (e: React.MouseEvent) => {
    // 阻止事件冒泡，防止触发表单提交
    e.preventDefault();
    e.stopPropagation();
    
    if (targetRef?.current) {
      targetRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`
        fixed z-50
        w-12 h-12 rounded-full
        bg-primary text-primary-foreground
        shadow-lg hover:shadow-xl
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        flex items-center justify-center
        bottom-6 left-6
        md:right-6 md:left-auto
        ${className}
      `}
      aria-label="回到顶部"
      title="回到顶部"
    >
      <ChevronUp className="w-6 h-6" />
    </button>
  );
};

export default ScrollToTop; 