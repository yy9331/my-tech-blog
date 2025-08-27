import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

type CreatePostBody = {
  title: string;
  content: string;
  tags?: string[];
  author?: string;
  readTime?: string | null;
  date?: string; // ISO string
  github_url?: string;
  slug?: string; // 可选，未提供则由服务端生成
  user_id?: string; // 可选，未提供则不写入
  // 新增安全字段
  client_id?: string; // 客户端标识
  signature?: string; // 请求签名
  timestamp?: number; // 时间戳
};

const HEADER_KEY = 'x-mcp-secret';
const ALLOWED_CLIENTS = process.env.MCP_ALLOWED_CLIENTS?.split(',') || [];
const SIGNATURE_SECRET = process.env.MCP_SIGNATURE_SECRET;

export async function POST(req: NextRequest) {
  const secret = process.env.MCP_SHARED_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Server not configured: MCP_SHARED_SECRET missing' }, { status: 500 });
  }

  // 1. 基础密钥验证
  const provided = req.headers.get(HEADER_KEY);
  if (!provided || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: CreatePostBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // 2. 客户端白名单验证
  if (ALLOWED_CLIENTS.length > 0 && body.client_id && !ALLOWED_CLIENTS.includes(body.client_id)) {
    return NextResponse.json({ error: 'Client not authorized' }, { status: 403 });
  }

  // 3. 时间戳验证（防止重放攻击）
  if (body.timestamp) {
    const now = Date.now();
    const timeDiff = Math.abs(now - body.timestamp);
    const maxTimeDiff = 5 * 60 * 1000; // 5分钟
    if (timeDiff > maxTimeDiff) {
      return NextResponse.json({ error: 'Request expired' }, { status: 401 });
    }
  }

  // 4. 签名验证（如果配置了签名密钥）
  if (SIGNATURE_SECRET && body.signature) {
    const { createHmac } = await import('crypto');
    const expectedSignature = createHmac('sha256', SIGNATURE_SECRET)
      .update(JSON.stringify({ ...body, signature: undefined }))
      .digest('hex');
    
    if (body.signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const {
    title,
    content,
    tags = [],
    author = '',
    readTime = null,
    date,
    github_url = '',
    slug,
    user_id,
  } = body;

  if (!title || !content) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    // 1) 先 upsert 新标签（忽略重复）
    if (tags.length > 0) {
      const tagsToInsert = tags.map((name) => ({ name }));
      const { error: tagError } = await admin
        .from('Tags')
        .upsert(tagsToInsert, { onConflict: 'name', ignoreDuplicates: true });
      if (tagError) {
        return NextResponse.json({ error: 'Failed to upsert tags', details: tagError.message }, { status: 500 });
      }
    }

    // 2) 生成 slug（如果未提供）
    const finalSlug = slug ?? crypto.randomUUID();

    // 3) upsert 文章
    const { error: postError } = await admin
      .from('Post')
      .upsert(
        {
          slug: finalSlug,
          title,
          date: date ?? new Date().toISOString(),
          author,
          user_id: user_id ?? null,
          tags,
          content,
          readTime: readTime === '' ? null : readTime,
          lastModified: new Date().toISOString(),
          github_url,
          isShown: true, // 默认显示文章
        },
        { onConflict: 'slug' }
      );

    if (postError) {
      return NextResponse.json({ error: 'Failed to upsert post', details: postError.message }, { status: 500 });
    }

    return NextResponse.json({ slug: finalSlug, message: 'ok' });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: 'Unexpected error', details: errorMessage }, { status: 500 });
  }
}