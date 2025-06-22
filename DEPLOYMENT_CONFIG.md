# 部署配置说明

## 问题描述
在生产环境中，GitHub Auth登录后重定向到 `http://localhost:3000` 而不是正确的生产域名。

## 解决方案

### 1. 环境变量配置
在部署环境中设置以下环境变量：

```bash
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# 生产环境域名配置（重要！）
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 2. Supabase项目配置
在Supabase控制台中，确保GitHub OAuth的重定向URL配置正确：

1. 登录Supabase控制台
2. 进入你的项目
3. 导航到 Authentication > URL Configuration
4. 在 "Redirect URLs" 中添加：
   ```
   https://your-domain.com/auth/callback
   ```

### 3. GitHub OAuth应用配置
在GitHub OAuth应用设置中，确保回调URL配置正确：

1. 登录GitHub
2. 进入 Settings > Developer settings > OAuth Apps
3. 找到你的OAuth应用
4. 在 "Authorization callback URL" 中设置：
   ```
   https://your-domain.com/auth/callback
   ```

## 代码修改说明

### 已修复的文件：

1. **`components/login-form.tsx`**
   - 使用 `process.env.NEXT_PUBLIC_SITE_URL` 替代 `window.location.origin`
   - 确保重定向URL使用正确的生产域名

2. **`app/auth/callback/route.ts`**
   - 使用环境变量获取正确的域名
   - 确保所有重定向都指向正确的生产域名

### 环境变量优先级：
1. `NEXT_PUBLIC_SITE_URL` - 生产环境配置
2. `window.location.origin` - 开发环境回退

## 部署检查清单

- [ ] 设置 `NEXT_PUBLIC_SITE_URL` 环境变量
- [ ] 配置Supabase重定向URL
- [ ] 配置GitHub OAuth回调URL
- [ ] 重启应用服务器
- [ ] 测试GitHub登录流程

## 常见问题

### Q: 为什么会出现localhost重定向？
A: 这是因为代码中使用了 `window.location.origin`，在某些情况下可能获取到错误的域名。

### Q: 如何验证配置是否正确？
A: 检查浏览器开发者工具的网络请求，确保重定向URL指向正确的生产域名。

### Q: 开发环境需要配置吗？
A: 开发环境可以继续使用 `window.location.origin`，或者设置 `NEXT_PUBLIC_SITE_URL=http://localhost:3000`。 