'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import NotificationCenter from './notification-center';
import { getUnreadNotificationsCount } from '@/lib/notifications';

export default function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // 获取未读通知数量
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const count = await getUnreadNotificationsCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  // 定期更新未读数量
  useEffect(() => {
    if (!user) return;
    
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // 如果没有登录，不显示通知按钮
  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
        title="通知中心"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      <NotificationCenter 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        onNotificationUpdate={fetchUnreadCount}
      />
    </>
  );
} 