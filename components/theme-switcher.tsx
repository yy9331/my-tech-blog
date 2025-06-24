"use client";

import React, { useEffect, useState } from 'react';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

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

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme-preference', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // 添加调试信息
    console.log('Theme toggled to:', newTheme);
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
    <button
      onClick={toggleTheme}
      className="theme-toggle p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
      title="切换主题"
      aria-label={theme}
      aria-live="polite"
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
};

export default ThemeSwitcher;
