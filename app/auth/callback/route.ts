import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // 成功认证后重定向到首页或指定页面
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 如果出现错误，重定向到登录页面并显示错误信息
  return NextResponse.redirect(`${origin}/auth/login?error=OAuth authentication failed`);
} 