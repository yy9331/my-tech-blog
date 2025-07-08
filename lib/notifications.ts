import { createClient } from '@/lib/supabase/client';

export interface Notification {
  id: string;
  post_slug: string;
  post_title: string;
  comment_id: number;
  comment_content: string;
  commenter_name: string;
  is_read: boolean;
  created_at: string;
}

// 创建通知
export async function createNotification(
  postSlug: string,
  postTitle: string,
  commentId: number,
  commentContent: string,
  commenterName: string,
  postOwnerId: string
) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: postOwnerId,
        post_slug: postSlug,
        post_title: postTitle,
        comment_id: commentId,
        comment_content: commentContent,
        commenter_name: commenterName
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// 获取用户的通知
export async function getUserNotifications(userId: string) {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

// 标记通知为已读
export async function markNotificationAsRead(notificationId: string) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// 标记所有通知为已读
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// 删除通知
export async function deleteNotification(notificationId: string) {
  try {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// 获取未读通知数量
export async function getUnreadNotificationsCount(userId: string) {
  try {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
} 