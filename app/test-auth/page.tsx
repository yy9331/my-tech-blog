'use client'
import { useAuth } from '@/lib/auth-context';

export default function TestAuthPage() {
  const { isLoggedIn, userEmail, userName, userAvatar, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">认证状态测试</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">登录状态</h2>
            <p className="text-gray-300">
              {isLoggedIn ? '✅ 已登录' : '❌ 未登录'}
            </p>
          </div>

          {isLoggedIn && (
            <>
              <div>
                <h2 className="text-xl font-semibold mb-2">用户信息</h2>
                <div className="space-y-2 text-gray-300">
                  <p><strong>邮箱:</strong> {userEmail || '未设置'}</p>
                  <p><strong>用户名:</strong> {userName || '未设置'}</p>
                  <p><strong>头像URL:</strong> {userAvatar || '未设置'}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">完整用户对象</h2>
                <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">用户元数据</h2>
                <pre className="bg-gray-700 p-4 rounded text-sm overflow-auto">
                  {JSON.stringify(user?.user_metadata, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 