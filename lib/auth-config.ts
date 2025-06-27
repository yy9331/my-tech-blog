// 认证配置
export const AUTH_CONFIG = {
  // 允许登录的邮箱地址（管理员）
  ALLOWED_EMAILS: [
    'yuyi.gz@163.com',
    'yuyigz@gmail.com',
    // 可以添加其他允许的邮箱
  ],
  
  // 允许登录的GitHub用户名（管理员）
  ALLOWED_GITHUB_USERS: [
    'yy9331', // 你的GitHub用户名
    // 可以添加其他允许的GitHub用户名
  ],
  
  // 是否启用GitHub登录
  ENABLE_GITHUB_LOGIN: true,
  
  // 是否启用邮箱登录
  ENABLE_EMAIL_LOGIN: true,
  
  // 是否允许所有GitHub用户登录（用于评论区）
  ALLOW_ALL_GITHUB_USERS: true,
};

// 用户类型定义
interface User {
  email?: string;
  user_metadata?: {
    user_name?: string;
    preferred_username?: string;
  };
}

// 验证邮箱是否允许登录（管理员权限）
export function isEmailAllowed(email: string): boolean {
  return AUTH_CONFIG.ALLOWED_EMAILS.includes(email);
}

// 验证GitHub用户名是否允许登录（管理员权限）
export function isGitHubUserAllowed(username: string): boolean {
  return AUTH_CONFIG.ALLOWED_GITHUB_USERS.includes(username);
}

// 验证是否为管理员（用于评论管理等功能）
export function isAdmin(user: User | null): boolean {
  if (!user) return false;
  
  // 检查邮箱
  if (user.email && AUTH_CONFIG.ALLOWED_EMAILS.includes(user.email)) {
    return true;
  }
  
  // 检查GitHub用户名（基于实际数据结构）
  const githubUsername = user.user_metadata?.user_name || 
                        user.user_metadata?.preferred_username;
  
  if (githubUsername && AUTH_CONFIG.ALLOWED_GITHUB_USERS.includes(githubUsername)) {
    return true;
  }
  
  return false;
} 