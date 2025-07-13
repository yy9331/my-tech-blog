import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import WriteEditor from '@/app/write/components/write-editor';

export default async function Page({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const resolvedParams = await searchParams;
  const editSlug = resolvedParams.edit;
  
  let initialPost = null;

  try {
    const supabase = await createClient();
    
    // 如果是编辑模式，获取文章数据
    if (editSlug) {
      const { data: post, error } = await supabase
        .from('Post')
        .select('*')
        .eq('isShown', true)
        .eq('slug', editSlug)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching post:', error);
        notFound();
      }

      if (post) {
        initialPost = post;
      }
    }
  } catch (error) {
    console.error('Error in WritePage:', error);
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sky-400 text-xl">加载中...</div>
      </div>
    }>
      <WriteEditor 
        editSlug={editSlug || null} 
        initialPost={initialPost}
      />
    </Suspense>
  );
}