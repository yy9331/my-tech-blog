import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const secret = process.env.MCP_SHARED_SECRET;
  if (!secret) 
    return NextResponse.json({ error: 'Server not configured: MCP_SHARED_SECRET missing' }, { status: 500 });
  

  const provided = req.headers.get('x-mcp-secret');
  if (!provided || provided !== secret) 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  try {
    const admin = createAdminClient();

    // 从 Post 表中获取所有不重复的标签
    const { data: posts, error } = await admin
    .from('Post')
    .select('tags')
    .eq('isShown', true);

    if (error) return NextResponse.json({ error: 'Failed to fetch tags', details: error.message }, { status: 500 });

    // 提取所有标签并去重
    const allTags = new Set<string>();
    posts?.forEach((post: { tags: string[] }) => {
        if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: string) => allTags.add(tag));
        }
    });

    // 返回标签数组
    return NextResponse.json(Array.from(allTags).sort());
  }catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Unexpected error', details: errorMessage }, { status: 500 });
  }
}