import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { isGitHubUserAllowed } from "@/lib/auth-config";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // 检查是否是GitHub登录
      const provider = data.user.app_metadata?.provider;
      
      if (provider === 'github') {
        // 获取GitHub用户名
        const githubUsername = data.user.user_metadata?.user_name || 
                              data.user.user_metadata?.login ||
                              data.user.user_metadata?.name;
        
        // 检查是否在允许列表中
        if (!githubUsername || !isGitHubUserAllowed(githubUsername)) {
          // 不在允许列表中，登出用户并重定向到错误页面
          await supabase.auth.signOut();
          return NextResponse.redirect(`${origin}/auth/login?error=Access denied. Only authorized GitHub users can login.`);
        }
      }
      
      // 验证通过，重定向到目标页面
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 如果出现错误，重定向到登录页面并显示错误信息
  return NextResponse.redirect(`${origin}/auth/login?error=OAuth authentication failed`);
} 