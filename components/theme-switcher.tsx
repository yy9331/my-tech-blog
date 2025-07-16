"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [nextTheme, setNextTheme] = useState<'light' | 'dark'>('light');
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    // 从 localStorage 获取主题偏好
    const savedTheme = localStorage.getItem('theme-preference') as 'light' | 'dark';
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = savedTheme || systemTheme;
    
    setTheme(currentTheme);
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // 添加调试信息
    console.log('Theme initialized:', currentTheme);
  }, []);

  // 计算按钮中心点
  const getButtonCenter = () => {
    if (!buttonRef.current) return { x: 0, y: 0 };
    const rect = buttonRef.current.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  // 计算最大扩散半径
  const getMaxRadius = () => {
    if (typeof window === 'undefined') return 0;
    const { x, y } = getButtonCenter();
    const w = window.innerWidth;
    const h = window.innerHeight;
    return Math.sqrt(Math.max(x, w - x) ** 2 + Math.max(y, h - y) ** 2);
  };

  const handleToggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setNextTheme(newTheme);
    setAnimating(true);
  };

  const handleAnimationComplete = () => {
    setTheme(nextTheme);
    localStorage.setItem('theme-preference', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    setAnimating(false);
  };

  // 防止服务端渲染不匹配
  if (!mounted) {
    return (
      <button
        className="theme-toggle p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
        title="切换主题"
        aria-label="loading"
      >
        <svg 
          className="sun-and-moon w-6 h-6" 
          aria-hidden="true" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24"
        >
          <mask className="moon" id="moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <circle cx="24" cy="10" r="6" fill="black" />
          </mask>
          <circle 
            className="sun" 
            cx="12" 
            cy="12" 
            r="6" 
            mask="url(#moon-mask)" 
            fill="currentColor" 
          />
          <g className="sun-beams" stroke="currentColor">
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      </button>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="theme-toggle p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
        title="切换主题"
        aria-label={theme}
        aria-live="polite"
        style={{ position: 'relative', zIndex: 20 }}
      >
        <svg 
          className="sun-and-moon w-6 h-6" 
          aria-hidden="true" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24"
        >
          <mask className="moon" id="moon-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <circle cx="24" cy="10" r="6" fill="black" />
          </mask>
          <circle 
            className="sun" 
            cx="12" 
            cy="12" 
            r="6" 
            mask="url(#moon-mask)" 
            fill="currentColor" 
          />
          <g className="sun-beams" stroke="currentColor">
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </g>
        </svg>
      </button>
      <AnimatePresence>
        {animating && (
          <motion.div
            key="theme-ripple"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: getMaxRadius() / 20, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              left: getButtonCenter().x - 20,
              top: getButtonCenter().y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: nextTheme === 'dark' ? 'rgba(23,35,64,0.90)' : 'rgba(255,250,240,0.90)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ThemeSwitcher;
