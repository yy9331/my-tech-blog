'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase/client';

const Header = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 shadow-lg z-50">
      <div className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-sky-400 hover:text-sky-300 transition-colors">
            My Tech Blog
          </Link>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-sky-400 transition-colors">
              首页
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-sky-400 transition-colors">
              关于
            </Link>
            <Link href="/write" className="text-gray-300 hover:text-sky-400 transition-colors">
              写文章
            </Link>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors"
              >
                登出
              </button>
            ) : (
              <Link
                href="auth/login"
                className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors"
              >
                登录
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;