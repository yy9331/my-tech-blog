import { 
  createNotification, 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  getUnreadNotificationsCount 
} from './notifications';

// 模拟测试数据
const mockNotification = {
  postSlug: 'test-post',
  postTitle: '测试文章',
  commentId: 123,
  commentContent: '这是一条测试评论',
  commenterName: '测试用户',
  postOwnerId: 'test-user-id'
};

// 测试创建通知
export async function testCreateNotification() {
  try {
    const result = await createNotification(
      mockNotification.postSlug,
      mockNotification.postTitle,
      mockNotification.commentId,
      mockNotification.commentContent,
      mockNotification.commenterName,
      mockNotification.postOwnerId
    );
    console.log('✅ 创建通知测试通过:', result);
    return result;
  } catch (error) {
    console.error('❌ 创建通知测试失败:', error);
    throw error;
  }
}

// 测试获取用户通知
export async function testGetUserNotifications(userId: string) {
  try {
    const notifications = await getUserNotifications(userId);
    console.log('✅ 获取用户通知测试通过:', notifications.length, '条通知');
    return notifications;
  } catch (error) {
    console.error('❌ 获取用户通知测试失败:', error);
    throw error;
  }
}

// 测试获取未读数量
export async function testGetUnreadCount(userId: string) {
  try {
    const count = await getUnreadNotificationsCount(userId);
    console.log('✅ 获取未读数量测试通过:', count);
    return count;
  } catch (error) {
    console.error('❌ 获取未读数量测试失败:', error);
    throw error;
  }
}

// 测试标记所有通知为已读
export async function testMarkAllAsRead(userId: string) {
  try {
    await markAllNotificationsAsRead(userId);
    console.log('✅ 标记所有通知为已读测试通过');
  } catch (error) {
    console.error('❌ 标记所有通知为已读测试失败:', error);
    throw error;
  }
}

// 测试删除通知
export async function testDeleteNotification(notificationId: string) {
  try {
    await deleteNotification(notificationId);
    console.log('✅ 删除通知测试通过');
  } catch (error) {
    console.error('❌ 删除通知测试失败:', error);
    throw error;
  }
}

// 运行所有测试
export async function runNotificationTests(userId: string) {
  console.log('🚀 开始运行通知系统测试...');
  
  try {
    // 测试创建通知
    const newNotification = await testCreateNotification();
    
    // 测试获取用户通知
    await testGetUserNotifications(userId);
    
    // 测试获取未读数量
    await testGetUnreadCount(userId);
    
    // 如果有新创建的通知，测试标记为已读
    if (newNotification) {
      try {
        await markNotificationAsRead(newNotification.id);
        console.log('✅ 标记通知为已读测试通过');
      } catch (error) {
        console.error('❌ 标记通知为已读测试失败:', error);
      }
    }
    
    // 测试标记所有通知为已读
    await testMarkAllAsRead(userId);
    
    // 如果有新创建的通知，测试删除通知
    if (newNotification) {
      try {
        await testDeleteNotification(newNotification.id);
        console.log('✅ 删除通知测试通过');
      } catch (error) {
        console.error('❌ 删除通知测试失败:', error);
      }
    }
    
    console.log('🎉 所有测试完成！');
  } catch (error) {
    console.error('💥 测试过程中出现错误:', error);
  }
}

// 在浏览器控制台中运行测试的示例：
// import { runNotificationTests } from '@/lib/notifications.test';
// runNotificationTests('your-user-id'); 