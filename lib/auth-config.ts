// 认证配置
export const AUTH_CONFIG = {
  // 允许登录的邮箱地址
  ALLOWED_EMAILS: [
    'yuyi.gz@163.com',
    // 可以添加其他允许的邮箱
  ],
  
  // 允许登录的GitHub用户名
  ALLOWED_GITHUB_USERS: [
    'yy9331', // 你的GitHub用户名
    // 可以添加其他允许的GitHub用户名
  ],
  
  // 是否启用GitHub登录
  ENABLE_GITHUB_LOGIN: true,
  
  // 是否启用邮箱登录
  ENABLE_EMAIL_LOGIN: true,
};

// 验证邮箱是否允许登录
export function isEmailAllowed(email: string): boolean {
  return AUTH_CONFIG.ALLOWED_EMAILS.includes(email);
}

// 验证GitHub用户名是否允许登录
export function isGitHubUserAllowed(username: string): boolean {
  return AUTH_CONFIG.ALLOWED_GITHUB_USERS.includes(username);
} 