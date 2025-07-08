# 通知系统设置指南

## 问题描述
你遇到的问题是：插入评论数据后，前端的通知没有显示。

## 原因分析
通知系统需要知道文章作者的用户ID才能创建通知，但是：
1. Post 表的 `user_id` 字段为 NULL
2. 无法直接查询 `auth.users` 表来根据作者名称找到用户ID
3. 通知系统的触发器无法正常工作

## 解决方案

### 1. 更新现有文章的 user_id 字段
首先执行 `database/update_post_user_id.sql` 中的 SQL 语句来更新现有文章：

```sql
-- 在 Supabase SQL 编辑器中执行
-- 请将 '你的用户ID' 替换为你的实际用户ID
UPDATE "Post" 
SET user_id = '你的用户ID' 
WHERE user_id IS NULL;
```

### 2. 获取你的用户ID
1. 在浏览器控制台中运行：
```javascript
const { data: { user } } = await supabase.auth.getUser();
console.log('User ID:', user.id);
```

2. 或者在 Supabase Dashboard 中查看用户列表

### 3. 创建通知表
执行 `database/notifications_template.sql` 中的 SQL 语句来创建通知表。

### 4. 测试通知系统
1. 使用不同的用户账号登录
2. 在文章页面发表评论
3. 检查通知中心是否显示新通知

### 5. 验证设置
执行以下查询来验证设置是否正确：

```sql
-- 检查文章是否有 user_id
SELECT slug, title, author, user_id 
FROM "Post" 
WHERE user_id IS NOT NULL;

-- 检查通知表是否存在
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'notifications';
```

## 功能特性

### 通知类型
- **评论通知**：当有人评论你的文章时
- **回复通知**：当有人回复你的评论时

### 通知中心功能
- 显示未读通知数量
- 标记通知为已读
- 标记所有通知为已读
- 删除通知
- 点击通知跳转到相关文章

### 通知按钮
- 在头部导航栏显示通知按钮
- 显示未读通知数量徽章
- 点击打开通知中心

## 故障排除

### 常见问题

1. **通知没有创建**
   - 检查文章的 `user_id` 字段是否已设置
   - 确认评论者不是文章作者
   - 检查通知表是否正确创建

2. **通知按钮不显示**
   - 确认用户已登录
   - 检查通知按钮组件是否正确导入

3. **通知数量不更新**
   - 检查通知查询函数是否正确
   - 确认 RLS 策略配置正确

### 调试步骤

1. 检查浏览器控制台错误信息
2. 查看 Supabase 日志
3. 确认数据库表结构正确
4. 验证用户映射数据

## 代码修改说明

### 已修改的文件：

1. **`components/comments.tsx`**
   - 添加了通知创建逻辑
   - 直接使用 Post 表的 `user_id` 字段

2. **`components/header.tsx`**
   - 添加了通知按钮

3. **`lib/hooks/use-article-data.ts`**
   - 修改文章保存逻辑，自动设置 `user_id` 字段

4. **`database/update_post_user_id.sql`**
   - 提供了更新现有文章 `user_id` 的脚本

## 使用说明

### 对于管理员
1. 执行数据库脚本创建必要的表
2. 设置用户映射关系
3. 测试通知功能

### 对于用户
1. 登录后可以看到通知按钮
2. 点击通知按钮查看通知中心
3. 管理通知（标记已读、删除等）

## 安全说明
- 通知系统通过 RLS 策略保护
- 只有登录用户可以查看自己的通知
- 用户映射表也受到 RLS 保护 