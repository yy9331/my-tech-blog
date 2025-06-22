# 我的技术博客

一个基于 Next.js 和 Supabase 构建的现代化技术博客系统。

## 🚀 功能特性

- **现代化技术栈**: Next.js 15 + TypeScript + Tailwind CSS
- **数据库**: PostgreSQL
- **认证系统**: 支持邮箱密码和 GitHub OAuth 登录
- **Markdown 编辑器**: 支持实时预览和语法高亮
- **图片上传**: 支持图片上传和预览
- **标签系统**: 支持文章分类和标签管理
- **响应式设计**: 完美适配桌面端和移动端
- **目录导航**: 文章自动生成目录，支持滚动同步
- **主题切换**: 支持深色/浅色主题

## 📁 项目结构

```
my-tech-blog/
├── app/                    # Next.js App Router
│   ├── auth/              # 认证相关页面
│   ├── categories/        # 分类页面
│   ├── post/             # 文章详情页
│   ├── write/            # 写作页面
│   └── layout.tsx        # 根布局
├── components/           # React 组件
│   ├── ui/              # 基础 UI 组件
│   ├── toast/           # 提示组件
│   └── *.tsx           # 功能组件
├── lib/                 # 工具库
│   ├── supabase/       # Supabase 配置
│   └── auth-config.ts  # 认证配置
└── public/             # 静态资源
```

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **UI 组件**: shadcn/ui
- **Markdown**: react-markdown + remark-gfm
- **代码高亮**: react-syntax-highlighter
- **图标**: Lucide React

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm/yarn/pnpm

### 安装依赖

```bash
npm install
```

### 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置 Supabase 环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. 配置认证设置（参考 `AUTH_CONFIG.md`）

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 📝 使用说明

### 写作功能

1. 访问 `/write` 页面
2. 填写文章信息（标题、日期、作者等）
3. 使用 Markdown 编辑器编写内容
4. 支持实时预览和语法高亮
5. 点击保存按钮发布文章

### 认证系统

- 支持邮箱密码登录
- 支持 GitHub OAuth 登录
- 可配置允许登录的用户列表
- 支持密码重置功能

### 文章管理

- 支持文章分类和标签
- 自动生成文章目录
- 支持图片上传和预览
- 响应式设计，适配各种设备

## 🔧 配置说明

详细的认证配置说明请参考 [AUTH_CONFIG.md](./AUTH_CONFIG.md)

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
