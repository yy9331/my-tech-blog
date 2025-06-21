'use client'
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

const Header = () => {
  const { isLoggedIn, setIsLoggedIn, userEmail, userName, userAvatar } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/');
  };

  // 移动端菜单项点击后关闭菜单
  const handleMenuClick = (href: string) => {
    setMenuOpen(false);
    router.push(href);
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
        <div className="text-white text-sm font-medium">
          {userName || userEmail}
        </div>
        {userName && userEmail && (
          <div className="text-gray-300 text-xs">
            {userEmail}
          </div>
        )}
      </div>
      {/* 登出按钮 */}
      <button
        onClick={handleLogout}
        className="px-3 py-1.5 bg-transparent border border-white text-white text-sm rounded-md hover:bg-white hover:text-sky-700 transition-colors"
      >
        登出
      </button>
    </div>
  );

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
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
            <Link href="/" className="text-gray-300 hover:text-sky-400 transition-colors">
              首页
            </Link>
            <Link href="/categories" className="text-gray-300 hover:text-sky-400 transition-colors">
              分类
            </Link>
            <Link href="/write" className="text-gray-300 hover:text-sky-400 transition-colors">
              写文章
            </Link>
            {isLoggedIn ? (
              <UserInfo />
            ) : (
              <Link
                href="auth/login"
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors"
              >
                登录
              </Link>
            )}
          </div>
          {/* 移动端三明治按钮 */}
          <button className="md:hidden flex flex-col justify-center items-center w-10 h-10" onClick={() => setMenuOpen(true)} aria-label="打开菜单">
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white mb-1"></span>
            <span className="block w-6 h-0.5 bg-white"></span>
          </button>
        </nav>
      </div>
      {/* 移动端全屏菜单 */}
      {menuOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-95 z-50 flex flex-col items-center justify-center md:hidden">
          <button className="absolute top-6 right-6 text-white text-3xl" onClick={() => setMenuOpen(false)} aria-label="关闭菜单">×</button>
          <button className="w-3/4 py-4 text-2xl text-white font-bold mb-6 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/')}>首页</button>
          <button className="w-3/4 py-4 text-2xl text-white font-bold mb-6 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/categories')}>分类</button>
          <button className="w-3/4 py-4 text-2xl text-white font-bold mb-10 rounded-lg bg-sky-700 hover:bg-sky-600" onClick={() => handleMenuClick('/write')}>写文章</button>
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
                  <div className="text-white text-lg font-medium">
                    {userName || userEmail}
                  </div>
                  {userName && userEmail && (
                    <div className="text-gray-300 text-sm">
                      {userEmail}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setMenuOpen(false); handleLogout(); }}
                className="w-full py-3 text-lg text-white rounded-lg bg-transparent border border-white hover:bg-white hover:text-sky-700"
              >登出</button>
            </div>
          ) : (
            <button
              onClick={() => handleMenuClick('auth/login')}
              className="w-3/4 py-3 text-lg text-white rounded-lg bg-sky-600 hover:bg-sky-500"
            >登录</button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;