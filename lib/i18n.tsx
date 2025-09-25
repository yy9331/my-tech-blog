'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'zh' | 'en';

type Dict = Record<string, string>;

const zh: Dict = {
  nav_home: '首页',
  nav_categories: '分类',
  nav_write: '新文章',
  login: '登录',
  logout: '登出',
  footer_about: '关于我们',
  footer_quicklinks: '快速链接',
  footer_contact: '联系方式',
  footer_desc: '分享技术见解，记录学习历程，探讨编程之道。',
  email: '邮箱',
  github: 'GitHub',
  save: '保存',
  saving: '保存中...',
  tabs_preview: '预览',
  tabs_split: '分屏',
  tabs_save_and_preview: '保存并预览',
  editor_placeholder: '请输入正文...',
  sort_title: '排序方式：',
  sort_latest: '最新发布',
  sort_earliest: '最早发布',
  sort_modified: '最近修改',
  settings_notifications: '通知',
  settings_theme: '主题',
  settings_language: '语言'
};

const en: Dict = {
  nav_home: 'Home',
  nav_categories: 'Categories',
  nav_write: 'New Post',
  login: 'Login',
  logout: 'Logout',
  footer_about: 'About',
  footer_quicklinks: 'Quick Links',
  footer_contact: 'Contact',
  footer_desc: 'Share insights, record learning, and explore coding.',
  email: 'Email',
  github: 'GitHub',
  save: 'Save',
  saving: 'Saving...',
  tabs_preview: 'Preview',
  tabs_split: 'Split',
  tabs_save_and_preview: 'Save and Preview',
  editor_placeholder: 'Write something...',
  sort_title: 'Sort by:',
  sort_latest: 'Latest',
  sort_earliest: 'Earliest',
  sort_modified: 'Last Modified',
  settings_notifications: 'Notifications',
  settings_theme: 'Theme',
  settings_language: 'Language'
};

const KEY = 'blog_lang';

interface I18nContextValue {
  lang: Lang;
  t: (key: keyof typeof zh) => string;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('zh');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY) as Lang | null;
      if (stored === 'zh' || stored === 'en') {
        setLang(stored);
      } else {
        const browserIsZh = navigator.language?.toLowerCase().startsWith('zh');
        setLang(browserIsZh ? 'zh' : 'en');
      }
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
  }, [lang, ready]);

  const dict = lang === 'zh' ? zh : en;
  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key: keyof typeof zh) => dict[key] ?? String(key)
  }), [lang, dict]);

  if (!ready) return null;
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}


