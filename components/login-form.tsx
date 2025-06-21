'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/auth-context';
import { FaGithub } from 'react-icons/fa';

export default function LoginForm({ error: initialError }: { error?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError || '');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsLoggedIn } = useAuth();

  // 只允许你的邮箱
  const YOUR_EMAIL = 'yuyi.gz@163.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (email !== YOUR_EMAIL) {
      setError('只允许管理员登录');
      setIsLoading(false);
      return
    }
    try {
      const { error } = await createClient().auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      // 登录成功后更新状态
      setIsLoggedIn(true);
      // 登录成功后跳转回主页
      router.push('/')
    }catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    }finally{
      setIsLoading(false);
    }
  }

  // GitHub 登录
  const handleGitHubLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { error } = await createClient().auth.signInWithOAuth({ 
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) setError(error.message);
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold text-sky-400 mb-6 text-center">管理员登录</h2>
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
            required
          />
        </div>
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <Button 
          type="submit" 
          className="w-full bg-sky-600 hover:bg-sky-500 text-white p-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              登录中...
            </span>
          ) : (
            '登录'
          )}
        </Button>
      </form>
      <div className="my-6 flex items-center">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="mx-4 text-gray-400 text-sm">或</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>
      <Button
        type="button"
        onClick={handleGitHubLogin}
        className="w-full bg-gray-900 hover:bg-gray-700 text-white p-3 rounded-lg font-medium flex items-center justify-center gap-2 border border-gray-700"
        disabled={isLoading}
      >
        <FaGithub className="w-5 h-5" />
        使用 GitHub 登录
      </Button>
    </div>
  )
}