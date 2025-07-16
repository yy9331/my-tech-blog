'use client'
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import ThemeSwitcher from './theme-switcher';
import NotificationButton from './notification-button';
import { motion } from 'framer-motion';

const Header = () => {
  const { isLoggedIn, setIsLoggedIn, userEmail, userName, userAvatar } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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

  // 用户信息组件
  const UserInfo = () => (
    <div className="flex items-center space-x-3">
      {/* 用户头像 */}
      {userAvatar ? (
        <Image
          src={userAvatar}
          alt="用户头像"
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <div className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {userName ? userName.charAt(0).toUpperCase() : userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
        </div>
      )}
      {/* 用户信息 */}
      <div className="hidden sm:block text-left">
        <div className="text-foreground text-sm font-medium">
          {userName || userEmail}
        </div>
        {userName && userEmail && (
          <div className="text-muted-foreground text-xs">
            {userEmail}
          </div>
        )}
      </div>
      {/* 登出按钮 */}
      <motion.button
        onClick={handleLogout}
        className="px-3 py-1.5 bg-transparent border border-foreground text-foreground text-sm rounded-md hover:bg-foreground hover:text-background transition-colors"
        whileHover={{ scale: 1.10 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        登出
      </motion.button>
    </div>
  );

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
                  src="https://oikbmogyevlxggbzfpnp.supabase.co/storage/v1/object/sign/imgs/logo-cube-horizon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xMjQxNTU4Ny05NWFmLTRlY2EtODYzYS1mOGVhMTYyNGM2NDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWdzL2xvZ28tY3ViZS1ob3Jpem9uLnBuZyIsImlhdCI6MTc0OTk2NzI3NiwiZXhwIjoyNjEzODgwODc2fQ.V1dIV3ZBMsk_L76pFHi-brKlr4ViRIkq9KH9awGXijc"
                  alt="logo"
                  width={141}
                  height={40}
                  priority
                  style={{ display: 'block' }}
                />
              </Link>
              {/* 桌面端菜单 */}
              <div className="hidden md:flex items-center space-x-6">
                <Link href="/">
                  <motion.span
                    className="inline-block text-muted-foreground hover:text-sky-400 hover:font-bold transition-colors transition-transform"
                    whileHover={{ scale: 1.18 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    首页
                  </motion.span>
                </Link>
                <Link href="/categories">
                  <motion.span
                    className="inline-block text-muted-foreground hover:text-sky-400 hover:font-bold transition-colors transition-transform"
                    whileHover={{ scale: 1.18 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    分类
                  </motion.span>
                </Link>
                <Link href="/write">
                  <motion.span
                    className="inline-block text-muted-foreground hover:text-sky-400 hover:font-bold transition-colors transition-transform"
                    whileHover={{ scale: 1.18 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    新文章
                  </motion.span>
                </Link>
                {isLoggedIn ? (
                  <UserInfo />
                ) : (
                  <motion.button
                    onClick={handleLogin}
                    className="px-4 py-1.5 bg-sky-600 border border-sky-600 text-white text-sm rounded-md hover:bg-sky-500 transition-colors"
                    whileHover={{ scale: 1.10 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    登录
                  </motion.button>
                )}
                {/* 主题切换按钮 */}
                <ThemeSwitcher />
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
              src="https://oikbmogyevlxggbzfpnp.supabase.co/storage/v1/object/sign/imgs/logo-cube-horizon.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV8xMjQxNTU4Ny05NWFmLTRlY2EtODYzYS1mOGVhMTYyNGM2NDYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWdzL2xvZ28tY3ViZS1ob3Jpem9uLnBuZyIsImlhdCI6MTc0OTk2NzI3NiwiZXhwIjoyNjEzODgwODc2fQ.V1dIV3ZBMsk_L76pFHi-brKlr4ViRIkq9KH9awGXijc"
              alt="logo"
              width={141}
              height={40}
              priority
              style={{ display: 'block' }}
            />
          </Link>
          {/* 桌面端菜单 */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/">
              <motion.span
                className="inline-block text-muted-foreground hover:text-sky-400 hover:font-bold transition-colors transition-transform"
                whileHover={{ scale: 1.18 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                首页
              </motion.span>
            </Link>
            <Link href="/categories">
              <motion.span
                className="inline-block text-muted-foreground hover:text-sky-400 hover:font-bold transition-colors transition-transform"
                whileHover={{ scale: 1.18 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                分类
              </motion.span>
            </Link>
            <Link href="/write">
              <motion.span
                className="inline-block text-muted-foreground hover:text-sky-400 hover:font-bold transition-colors transition-transform"
                whileHover={{ scale: 1.18 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                新文章
              </motion.span>
            </Link>
            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <NotificationButton />
                <UserInfo />
              </div>
            ) : (
              <motion.button
                onClick={handleLogin}
                className="px-4 py-1.5 bg-sky-600 border border-sky-600 text-white text-sm rounded-md hover:bg-sky-500 transition-colors"
                whileHover={{ scale: 1.10 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                登录
              </motion.button>
            )}
            {/* 主题切换按钮 */}
            <ThemeSwitcher />
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
    </header>
  );
};

export default Header;