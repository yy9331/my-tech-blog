'use client'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import ThemeSwitcher from './theme-switcher';
import SettingsMenu from './settings-menu';
import { useI18n } from '@/lib/i18n';
import { motion } from 'framer-motion';

const Header = () => {
  const { isLoggedIn, setIsLoggedIn, userEmail, userName, userAvatar } = useAuth();
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  // 检查是否在 write 页面
  const isWritePage = pathname === '/write' || pathname.startsWith('/write?');

  useEffect(() => {
    // 只在客户端执行
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = () => {
    const redirectUrl = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
    router.push(redirectUrl);
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/');
  };

  // 移动端菜单项点击后关闭菜单
  const handleMenuClick = (href: string) => {
    setMenuOpen(false);
    if (href === 'auth/login') {
      handleLogin();
    } else {
      router.push(href);
    }
  };

  // 导航链接组件
  const NavLink = ({ href, children }: { href: string; children: string }) => {
    const isActive = pathname === href;
    
    return (
      <Link href={href}>
        <motion.div
          className={`relative inline-block transition-colors cursor-pointer group ${
            isActive 
              ? 'text-sky-400 font-medium' 
              : 'text-muted-foreground hover:text-sky-400'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onHoverStart={() => setHoveredLink(href)}
          onHoverEnd={() => setHoveredLink(null)}
        >
          <span className="relative z-10">{children}</span>
          
          {/* 当前页面状态 - 实心背景 */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-sky-400/10 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
          
          {/* 悬停状态 - 下划线动画 */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-sky-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ 
              width: (hoveredLink === href && !isActive) ? "100%" : 0,
              transition: { 
                type: "tween", 
                duration: 0.3, 
                ease: "easeOut" 
              }
            }}
          />
          
          {/* 点击时的闯入动画 */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-sky-400 rounded-full opacity-0"
            initial={{ width: 0, x: -20 }}
            whileTap={{ 
              width: "120%",
              x: 0,
              opacity: 1,
              transition: { 
                type: "spring", 
                stiffness: 500, 
                damping: 20,
                duration: 0.2
              }
            }}
          />
        </motion.div>
      </Link>
    );
  };

  // 如果在 write 页面，移动端始终显示 header，桌面端 hover 控制
  if (isWritePage) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 z-50"
        onMouseEnter={() => { if (!isMobile) setIsHovered(true); }}
        onMouseLeave={() => { if (!isMobile) setIsHovered(false); }}
      >
        {/* 顶部 header */}
        <header className={`bg-card shadow-lg transition-all duration-300 ${
          isHovered || isMobile ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="container mx-auto px-6 py-4">
            <nav className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
                <Image
                  src="https://oikbmogyevlxggbzfpnp.supabase.co/storage/v1/object/public/some-imgs/pyro-wings-batch-no-bg.png"
                  alt="My Tech Blog Logo"
                  width={70}
                  height={20}
                  priority
                  style={{ display: 'block', objectFit: 'contain' }}
                />
              </Link>
              {/* 桌面端菜单 */}
              <div className="hidden md:flex items-center space-x-6">
                <NavLink href="/">{t('nav_home')}</NavLink>
                <NavLink href="/categories">{t('nav_categories')}</NavLink>
                <NavLink href="/write">{t('nav_write')}</NavLink>
                {/* 设置菜单（包含主题、语言、通知、登录登出、用户信息） */}
                <SettingsMenu />
              </div>
              {/* 移动端三明治按钮 */}
              <motion.button className="md:hidden flex flex-col justify-center items-center w-10 h-10" onClick={() => setMenuOpen(true)} aria-label="打开菜单"
                whileHover={{ scale: 1.10 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <span className="block w-6 h-0.5 bg-foreground mb-1"></span>
                <span className="block w-6 h-0.5 bg-foreground mb-1"></span>
                <span className="block w-6 h-0.5 bg-foreground"></span>
              </motion.button>
            </nav>
          </div>
        </header>
        {/* 移动端全屏菜单，移到 header 外部，确保全屏覆盖 */}
        {menuOpen && (
          <div className="fixed inset-0 w-full h-full bg-background/95 z-[9999] flex flex-col items-center justify-center md:hidden">
            <motion.button className="absolute top-6 right-6 text-foreground text-3xl" onClick={() => setMenuOpen(false)} aria-label="关闭菜单"
              whileHover={{ scale: 1.10 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >×</motion.button>
            <motion.button className="w-3/4 py-4 text-2xl text-foreground font-bold mb-6 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/')}>首页</motion.button>
            <motion.button className="w-3/4 py-4 text-2xl text-foreground font-bold mb-6 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/categories')}>分类</motion.button>
            <motion.button className="w-3/4 py-4 text-2xl text-foreground font-bold mb-10 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/write')}>新文章</motion.button>
            {isLoggedIn ? (
              <div className="w-3/4 flex flex-col items-center space-y-4">
                {/* 移动端用户信息 */}
                <div className="flex items-center space-x-3 mb-4">
                  {userAvatar ? (
                    <Image
                      src={userAvatar}
                      alt="用户头像"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                      {userName ? userName.charAt(0).toUpperCase() : userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-foreground text-lg font-medium">
                      {userName || userEmail}
                    </div>
                    {userName && userEmail && (
                      <div className="text-muted-foreground text-sm">
                        {userEmail}
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="w-full py-3 text-lg text-foreground rounded-lg bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                  whileHover={{ scale: 1.10 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >登出</motion.button>
              </div>
            ) : (
              <motion.button
                onClick={() => handleMenuClick('auth/login')}
                className="w-3/4 py-3 text-lg text-white rounded-lg bg-sky-600 hover:bg-sky-500"
                whileHover={{ scale: 1.10 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >登录</motion.button>
            )}
            {/* 移动端主题切换按钮 */}
            <div className="w-3/4 mt-4 flex justify-center">
              <ThemeSwitcher />
            </div>
          </div>
        )}
      </div>
    );
  }

  // 普通页面的 header
  return (
    <header className="fixed top-0 left-0 right-0 bg-card dark:bg-card shadow-lg z-50">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
            <Image
              src="https://oikbmogyevlxggbzfpnp.supabase.co/storage/v1/object/public/some-imgs/pyro-wings-batch-no-bg.png"
              alt="My Tech Blog Logo"
              width={70}
              height={20}
              priority
              style={{ display: 'block', objectFit: 'contain' }}
            />
          </Link>
          {/* 桌面端菜单 */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink href="/">{t('nav_home')}</NavLink>
            <NavLink href="/categories">{t('nav_categories')}</NavLink>
            <NavLink href="/write">{t('nav_write')}</NavLink>
            {/* 设置菜单（包含主题、语言、通知、登录登出、用户信息） */}
            <SettingsMenu />
          </div>
          {/* 移动端三明治按钮 */}
          <motion.button className="md:hidden flex flex-col justify-center items-center w-10 h-10" onClick={() => setMenuOpen(true)} aria-label="打开菜单"
            whileHover={{ scale: 1.10 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <span className="block w-6 h-0.5 bg-foreground mb-1"></span>
            <span className="block w-6 h-0.5 bg-foreground mb-1"></span>
            <span className="block w-6 h-0.5 bg-foreground"></span>
          </motion.button>
        </nav>
      </div>
      {/* 移动端全屏菜单 */}
      {menuOpen && (
        <div className="fixed inset-0 bg-background/95 z-50 flex flex-col items-center justify-center md:hidden">
          <motion.button className="absolute top-6 right-6 text-foreground text-3xl" onClick={() => setMenuOpen(false)} aria-label="关闭菜单"
            whileHover={{ scale: 1.10 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >×</motion.button>
          <motion.button className="w-3/4 py-4 text-2xl text-foreground font-bold mb-6 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/')}>{t('nav_home')}</motion.button>
          <motion.button className="w-3/4 py-4 text-2xl text-foreground font-bold mb-6 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/categories')}>{t('nav_categories')}</motion.button>
          <motion.button className="w-3/4 py-4 text-2xl text-foreground font-bold mb-10 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/write')}>{t('nav_write')}</motion.button>
          {isLoggedIn ? (
            <div className="w-3/4 flex flex-col items-center space-y-4">
              {/* 移动端用户信息 */}
              <div className="flex items-center space-x-3 mb-4">
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt="用户头像"
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-sky-500 rounded-full flex items-center justify-center text-white text-lg font-medium">
                    {userName ? userName.charAt(0).toUpperCase() : userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-foreground text-lg font-medium">
                    {userName || userEmail}
                  </div>
                  {userName && userEmail && (
                    <div className="text-muted-foreground text-sm">
                      {userEmail}
                    </div>
                  )}
                </div>
              </div>
              <motion.button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full py-3 text-lg text-foreground rounded-lg bg-transparent border border-foreground hover:bg-foreground hover:text-background"
                whileHover={{ scale: 1.10 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >{t('logout')}</motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => handleMenuClick('auth/login')}
              className="w-3/4 py-3 text-lg text-white rounded-lg bg-sky-600 hover:bg-sky-500"
              whileHover={{ scale: 1.10 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >{t('login')}</motion.button>
          )}
          {/* 移动端主题切换按钮 */}
          <div className="w-3/4 mt-4 flex justify-center">
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;