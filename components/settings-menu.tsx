'use client'
import React from 'react';
import ThemeSwitcher from './theme-switcher';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import NotificationButton from './notification-button';

export default function SettingsMenu() {
  const { lang, setLang, t } = useI18n();
  const { isLoggedIn, setIsLoggedIn, userEmail, userName, userAvatar } = useAuth();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-lg hover:bg-accent border border-border text-foreground"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Settings"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .66.26 1.3.73 1.77.47.47 1.11.73 1.77.73H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"></path>
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-card shadow-xl p-3 z-50 space-y-3">
          {/* 账户信息 */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              {userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={userAvatar} alt="avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-sm">
                  {(userName || userEmail || 'U')[0]?.toUpperCase?.()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm text-foreground truncate">{userName || 'User'}</div>
                <div className="text-xs text-muted-foreground truncate">{userEmail}</div>
              </div>
            </div>
          ) : null}

          {/* 通知中心 */}
          {isLoggedIn ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{t('settings_notifications')}</span>
              <NotificationButton />
            </div>
          ) : null}

          {/* 主题 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t('settings_theme')}</span>
            <ThemeSwitcher />
          </div>
          {/* 语言 */}
          <div className="flex items-center justify-between">
            <label className="text-sm text-muted-foreground" htmlFor="lang-select">{t('settings_language')}</label>
            <select
              id="lang-select"
              className="px-2 py-1 bg-card border border-border rounded text-sm"
              value={lang}
              onChange={(e) => setLang(e.target.value as 'zh' | 'en')}
            >
              <option value="zh">中文</option>
              <option value="en">EN</option>
            </select>
          </div>

          {/* 操作 */}
          <div className="pt-2 border-t border-border">
            {isLoggedIn ? (
              <button
                className="w-full mt-2 px-3 py-2 text-sm rounded-md border border-foreground text-foreground hover:bg-foreground hover:text-background transition-colors"
                onClick={async () => {
                  await createClient().auth.signOut();
                  setIsLoggedIn(false);
                  router.push('/');
                  setOpen(false);
                }}
              >Logout</button>
            ) : (
              <button
                className="w-full mt-2 px-3 py-2 text-sm rounded-md bg-sky-600 text-white hover:bg-sky-500"
                onClick={() => {
                  router.push('/auth/login');
                  setOpen(false);
                }}
              >Login</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


