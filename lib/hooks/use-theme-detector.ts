import { useEffect, useState } from 'react';

export const useThemeDetector = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // 获取当前主题
    const getCurrentTheme = () => {
      const dataTheme = document.documentElement.getAttribute('data-theme') as 'light' | 'dark';
      return dataTheme || 'dark';
    };

    // 设置初始主题
    setTheme(getCurrentTheme());

    // 创建 MutationObserver 监听 data-theme 属性变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = getCurrentTheme();
          setTheme(newTheme);
        }
      });
    });

    // 开始监听
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    // 清理函数
    return () => observer.disconnect();
  }, []);

  return theme;
}; 