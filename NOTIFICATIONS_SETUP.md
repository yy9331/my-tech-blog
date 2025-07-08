# 通知系统设置指南

## 概述

这个通知系统会在用户对文章发表评论时，自动为文章作者创建通知。通知中心显示在页面顶部的导航栏中，只有登录用户才能看到。

## 功能特性

- 🔔 实时通知：当有人评论文章时，文章作者会收到通知
- 📱 响应式设计：支持桌面端和移动端
- ✅ 标记已读：点击通知或使用"标记所有已读"功能
- 🗑️ 删除通知：可以删除不需要的通知
- 🔢 未读计数：显示未读通知数量
- 🎨 美观界面：现代化的UI设计

## 数据库设置

### 1. 创建通知表

在 Supabase SQL 编辑器中执行以下 SQL：

```sql
-- 创建通知表
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "user_id" UUID NOT NULL REFERENCES auth.users("id") ON DELETE CASCADE,
    "post_slug" TEXT NOT NULL,
    "post_title" TEXT NOT NULL,
    "comment_id" BIGINT NOT NULL,
    "comment_content" TEXT NOT NULL,
    "commenter_name" TEXT NOT NULL,
    "is_read" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
CREATE INDEX IF NOT EXISTS "notifications_is_read_idx" ON "notifications"("is_read");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");
CREATE INDEX IF NOT EXISTS "notifications_post_slug_idx" ON "notifications"("post_slug");

-- 启用行级安全策略
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Allow users to view their own notifications" ON "notifications"
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Allow system to create notifications" ON "notifications"
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow users to update their own notifications" ON "notifications"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own notifications" ON "notifications"
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- 授予权限
GRANT ALL ON "notifications" TO authenticated;
```

### 2. 确保 Post 表有 user_id 字段

如果你的 Post 表还没有 user_id 字段，需要添加：

```sql
-- 为 Post 表添加 user_id 字段（如果还没有的话）
ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "user_id" UUID REFERENCES auth.users("id");
```

## 组件说明

### 1. NotificationButton (`components/notification-button.tsx`)
- 显示在导航栏中的通知按钮
- 显示未读通知数量
- 点击打开通知中心

### 2. NotificationCenter (`components/notification-center.tsx`)
- 通知中心主界面
- 显示通知列表
- 支持标记已读、删除通知等功能

### 3. 通知工具函数 (`lib/notifications.ts`)
- 创建通知
- 获取用户通知
- 标记已读/删除通知
- 获取未读数量

## 使用流程

1. **用户登录**：只有登录用户才能看到通知按钮
2. **发表评论**：当用户对文章发表评论时，系统会自动为文章作者创建通知
3. **查看通知**：点击通知按钮打开通知中心
4. **管理通知**：
   - 点击通知标记为已读
   - 点击删除按钮删除通知
   - 点击"标记所有已读"按钮

## 自定义配置

### 修改通知更新频率

在 `components/notification-button.tsx` 和 `components/notification-center.tsx` 中，可以修改以下代码来调整更新频率：

```typescript
const interval = setInterval(updateUnreadCount, 30000); // 30秒更新一次
```

### 修改通知显示数量

在 `lib/notifications.ts` 中修改：

```typescript
.limit(50); // 限制显示50条通知
```

## 故障排除

### 1. 通知没有创建
- 检查 Post 表是否有 user_id 字段
- 确认评论者不是文章作者本人
- 检查数据库权限设置

### 2. 通知按钮不显示
- 确认用户已登录
- 检查 AuthContext 是否正确配置

### 3. 通知数量不更新
- 检查网络连接
- 确认 Supabase 配置正确
- 查看浏览器控制台错误信息

## 注意事项

1. **性能考虑**：通知系统会定期查询数据库，建议在生产环境中适当调整更新频率
2. **安全性**：所有数据库操作都通过 RLS 策略保护
3. **用户体验**：通知创建失败不会影响评论发布流程
4. **兼容性**：支持现有的评论系统，无需修改现有评论数据

## 扩展功能

可以考虑添加的功能：
- 邮件通知
- 推送通知
- 通知分类（评论、点赞等）
- 通知设置页面
- 批量操作功能 