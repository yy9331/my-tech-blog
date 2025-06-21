# 认证配置说明

## 概述
本博客系统支持两种登录方式：
1. 邮箱密码登录
2. GitHub OAuth登录

为了安全起见，系统只允许特定的用户登录。

## 配置文件
认证配置位于 `lib/auth-config.ts` 文件中。

## 配置选项

### 允许的邮箱地址
```typescript
ALLOWED_EMAILS: [
  'abc@example.com',
  // 可以添加其他允许的邮箱
]
```

### 允许的GitHub用户名
```typescript
ALLOWED_GITHUB_USERS: [
  'abc', // 你的GitHub用户名
  // 可以添加其他允许的GitHub用户名
]
```

### 功能开关
```typescript
ENABLE_GITHUB_LOGIN: true,  // 是否启用GitHub登录
ENABLE_EMAIL_LOGIN: true,   // 是否启用邮箱登录
```

## 如何修改配置

### 添加新的邮箱用户
1. 在 `ALLOWED_EMAILS` 数组中添加邮箱地址
2. 确保该邮箱已在Supabase中注册

### 添加新的GitHub用户
1. 在 `ALLOWED_GITHUB_USERS` 数组中添加GitHub用户名
2. 该用户必须使用GitHub OAuth登录

### 禁用某种登录方式
将对应的 `ENABLE_*_LOGIN` 设置为 `false`

## 安全说明
- 只有配置文件中列出的用户才能成功登录
- 未授权的GitHub用户尝试登录会被拒绝并显示错误信息
- 未授权的邮箱用户尝试登录会显示"只允许管理员登录"错误

## 示例配置
```typescript
export const AUTH_CONFIG = {
  ALLOWED_EMAILS: [
    'admin@example.com',
    'editor@example.com'
  ],
  
  ALLOWED_GITHUB_USERS: [
    'your-github-username',
    'another-github-user'
  ],
  
  ENABLE_GITHUB_LOGIN: true,
  ENABLE_EMAIL_LOGIN: true,
};
``` 