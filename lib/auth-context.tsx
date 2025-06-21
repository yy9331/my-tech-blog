'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  userEmail: string | null;
  userName: string | null;
  userAvatar: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    // 获取 Supabase 客户端
    const supabase = createClient();
    
    // 初始检查登录状态
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUser(session.user);
        updateUserInfo(session.user);
      }
    };
    
    checkSession();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUser(session.user);
        updateUserInfo(session.user);
      } else {
        setUser(null);
        setUserEmail(null);
        setUserName(null);
        setUserAvatar(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const updateUserInfo = (user: User) => {
    // 设置邮箱
    setUserEmail(user.email || null);
    
    // 设置用户名和头像
    if (user.user_metadata) {
      // GitHub 登录
      if (user.user_metadata.provider === 'github') {
        setUserName(user.user_metadata.full_name || user.user_metadata.user_name || user.user_metadata.name || null);
        setUserAvatar(user.user_metadata.avatar_url || null);
      } 
      // 邮箱登录
      else {
        setUserName(user.user_metadata.full_name || user.user_metadata.name || user.email?.split('@')[0] || null);
        setUserAvatar(user.user_metadata.avatar_url || null);
      }
    } else {
      // 默认使用邮箱前缀作为用户名
      setUserName(user.email?.split('@')[0] || null);
      setUserAvatar(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      setIsLoggedIn, 
      user, 
      setUser, 
      userEmail, 
      userName, 
      userAvatar 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 