import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PostContent from './post-content';

export default async function PostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  if (!slug) {
    notFound();
  }

  try {
    const supabase = createClient();
    
    const { data: currentPost, error: currentError } = await supabase
      .from('Post')
      .select('*')
      .eq('slug', slug)
      .single();

    if (currentError || !currentPost) {
      notFound();
    }

    const { data: navigationPosts, error: navError } = await supabase
      .from('Post')
      .select('slug, title')
      .order('date', { ascending: false });

    if (navError) throw navError;

    const currentIndex = navigationPosts.findIndex(p => p.slug === slug);

    // 根据排序方式（日期降序）：
    // 上一篇（更早的文章，在数组中索引更大）
    const prevPost = currentIndex < navigationPosts.length - 1 
      ? navigationPosts[currentIndex + 1] 
      : null;
    // 下一篇（更晚的文章，在数组中索引更小）
    const nextPost = currentIndex > 0 
      ? navigationPosts[currentIndex - 1] 
      : null;

    return (
      <Suspense fallback={
        <div className="min-h-screen bg-background flex justify-center items-center pt-[66px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
        </div>
      }>
        <PostContent 
          post={currentPost} 
          prevPost={prevPost} 
          nextPost={nextPost} 
        />
      </Suspense>
    );

  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }
}