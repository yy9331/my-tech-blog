# 评论区功能设置指南

## 功能概述

本博客已集成评论区功能，支持以下特性：

- 🔐 GitHub OAuth 登录
- 💬 实时评论发布
- 👑 管理员评论管理
- 🎨 响应式设计
- ⚡ 自动加载和更新

## 数据库设置

### 1. 检查数据库表结构

首先运行以下查询来检查你的数据库表结构：

```sql
-- 查看所有表名
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. 创建评论表

在 Supabase 中执行以下 SQL 语句：

```sql
-- 创建评论表
-- 注意：根据你的代码，表名应该是 "Post"（大写），需要使用双引号
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  post_slug TEXT NOT NULL REFERENCES "Post"(slug) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_comments_post_slug ON comments(post_slug);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- 启用行级安全策略
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 创建策略：任何人都可以查看评论
CREATE POLICY "Anyone can view comments" ON comments
  FOR SELECT USING (true);

-- 创建策略：登录用户可以创建评论
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 创建策略：管理员可以删除任何评论
CREATE POLICY "Admins can delete any comment" ON comments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (
        auth.users.email IN ('yuyi.gz@163.com', 'yuyigz@gmail.com')
        OR auth.users.raw_user_meta_data->>'user_name' IN ('yy9331')
        OR auth.users.raw_user_meta_data->>'login' IN ('yy9331')
      )
    )
  );

-- 创建策略：用户只能更新自己的评论（可选功能）
CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 创建触发器来更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_comments_updated_at 
  BEFORE UPDATE ON comments 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 3. 如果表名不同

如果你的文章表名不是 `"Post"`，请使用以下查询来检查实际表名：

```sql
-- 检查数据库中的表结构
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

然后根据实际的表名修改上面的SQL语句中的 `REFERENCES "Post"(slug)` 部分。

### 4. 配置 GitHub OAuth

在 Supabase 中设置 GitHub OAuth：

1. 进入 Supabase Dashboard
2. 选择你的项目
3. 进入 `Authentication` > `Providers`
4. 启用 GitHub 提供商
5. 配置 GitHub OAuth 应用：
   - 在 GitHub 中创建新的 OAuth 应用
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
   - 将 Client ID 和 Client Secret 填入 Supabase

## 环境变量配置

确保在 `.env.local` 中配置了以下变量：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 管理员配置

在 `lib/auth-config.ts` 中配置管理员：

```typescript
export const AUTH_CONFIG = {
  // 管理员邮箱
  ALLOWED_EMAILS: [
    'yuyi.gz@163.com',
    'yuyigz@gmail.com',
  ],
  
  // 管理员 GitHub 用户名
  ALLOWED_GITHUB_USERS: [
    'yy9331',
  ],
  
  // 允许所有 GitHub 用户登录（用于评论区）
  ALLOW_ALL_GITHUB_USERS: true,
};
```

## 功能特性

### 用户功能
- ✅ 使用 GitHub 账号登录
- ✅ 发表评论
- ✅ 查看所有评论
- ✅ 自动显示用户头像和用户名

### 管理员功能
- ✅ 删除任何评论
- ✅ 管理员身份标识
- ✅ 评论管理权限

### 技术特性
- ✅ 实时评论加载
- ✅ 响应式设计
- ✅ 自动文本框高度调整
- ✅ 时间格式化显示
- ✅ 错误处理和用户提示
- ✅ 数据库行级安全策略

## 使用说明

### 对于访客
1. 在文章页面底部找到评论区
2. 点击"使用 GitHub 登录"按钮
3. 授权 GitHub 账号
4. 登录后即可发表评论

### 对于管理员
1. 使用配置的管理员账号登录
2. 在评论区可以看到"删除"按钮
3. 点击删除按钮可以删除任何评论
4. 管理员身份会在评论中显示"管理员"标识

## 安全说明

- 所有评论都通过 Supabase 行级安全策略保护
- 只有登录用户可以发表评论
- 只有管理员可以删除评论
- 用户信息通过 GitHub OAuth 安全获取

## 故障排除

### 常见问题

1. **GitHub 登录失败**
   - 检查 Supabase GitHub OAuth 配置
   - 确认 GitHub OAuth 应用的 callback URL 正确

2. **评论无法加载**
   - 检查数据库表是否正确创建
   - 确认 RLS 策略配置正确

3. **管理员权限不生效**
   - 检查 `auth-config.ts` 中的管理员配置
   - 确认用户邮箱或 GitHub 用户名正确

4. **表名错误**
   - 运行 `database/check_tables.sql` 检查实际表名
   - 根据实际表名修改 SQL 语句

### 调试步骤

1. 检查浏览器控制台错误信息
2. 查看 Supabase 日志
3. 确认环境变量配置正确
4. 验证数据库权限设置

## 自定义配置

你可以根据需要修改以下配置：

- 评论显示样式（在 `components/comments.tsx` 中）
- 管理员权限检查逻辑（在 `lib/auth-config.ts` 中）
- 数据库表结构（在 `database/comments.sql` 中）
- 认证流程（在 `app/auth/callback/route.ts` 中） 