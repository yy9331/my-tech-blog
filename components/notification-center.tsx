'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/toast/toast-context';
import { Bell, X, Check, Trash2, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  getUnreadNotificationsCount,
  type Notification 
} from '@/lib/notifications';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationUpdate?: () => void; // 添加回调函数
}

export default function NotificationCenter({ isOpen, onClose, onNotificationUpdate }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { showToast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 加载通知
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await getUserNotifications(user.id);
      setNotifications(data);
      
      // 计算未读数量
      const unread = data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
      showToast('加载通知失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  // 标记通知为已读
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // 更新本地状态
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      
      // 更新未读数量
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      // 通知父组件更新
      onNotificationUpdate?.();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showToast('标记已读失败', 'error');
    }
  };

  // 标记所有通知为已读
  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user!.id);
      
      // 更新本地状态
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      
      // 通知父组件更新
      onNotificationUpdate?.();
      
      showToast('已标记所有通知为已读', 'success');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showToast('标记已读失败', 'error');
    }
  };

  // 删除通知
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      
      // 更新本地状态
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // 如果删除的是未读通知，更新未读数量
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      // 通知父组件更新
      onNotificationUpdate?.();
      
      showToast('通知已删除', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showToast('删除通知失败', 'error');
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}小时前`;
    return `${Math.floor(diffInMinutes / 1440)}天前`;
  };

  // 点击通知处理
  const handleNotificationClick = async (notification: Notification) => {
    // 标记为已读
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    
    // 关闭通知中心
    onClose();
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // 加载通知
  useEffect(() => {
    if (isOpen && user) {
      loadNotifications();
    }
  }, [isOpen, user, loadNotifications]);

  // 定期更新未读数量
  useEffect(() => {
    if (!user) return;
    
    const updateUnreadCount = async () => {
      try {
        const count = await getUnreadNotificationsCount(user.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error updating unread count:', error);
      }
    };

    updateUnreadCount();
    const interval = setInterval(updateUnreadCount, 30000); // 每30秒更新一次

    return () => clearInterval(interval);
  }, [user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div 
        ref={dropdownRef}
        className="relative w-full max-w-md mx-4 bg-card border border-border rounded-lg shadow-lg max-h-[80vh] overflow-hidden"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-semibold text-foreground">通知中心</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="标记所有为已读"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 通知列表 */}
        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              加载中...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无通知</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.is_read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {notification.commenter_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        在文章《{notification.post_title}》中评论：
                      </p>
                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {notification.comment_content}
                      </p>
                      <Link
                        href={`/post/${notification.post_slug}`}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        查看文章 →
                      </Link>
                    </div>
                                         <button
                       onClick={(e) => {
                         e.stopPropagation();
                         handleDeleteNotification(notification.id);
                       }}
                       className="ml-2 p-1 text-muted-foreground hover:text-red-500 transition-colors"
                       title="删除通知"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 