import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const admin = createAdminClient();
    
    // 测试连接
    const { data, error } = await admin
      .from('Post')
      .select('count')
      .limit(1);
    
    if (error) {
      return NextResponse.json({ 
        error: 'Supabase连接失败', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      message: 'Supabase连接成功',
      data: data 
    });
  } catch (e) {
    return NextResponse.json({ 
      error: 'Unexpected error', 
      details: e instanceof Error ? e.message : String(e)
    }, { status: 500 });
  }
}
