'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { formatPostDate } from '@/lib/utils';
import PostSort, { SortOption } from './post-sort';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  date: string;
  readTime: number | null;
  tags: string[];
  lastModified?: string | null;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentSort, setCurrentSort] = useState<SortOption>('date-desc');
  const pageSize = 12;

  const loadPosts = async (pageNum: number, sortOption: SortOption) => {
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from('Post')
        .select('id, slug, title, content, date, readTime, tags, lastModified')
        .eq('isShown', true);

      // 根据排序选项设置排序
      switch (sortOption) {
        case 'date-desc':
          query = query.order('date', { ascending: false });
          break;
        case 'date-asc':
          query = query.order('date', { ascending: true });
          break;
        case 'lastModified':
          // 先按lastModified降序排列（有日期的在前），然后按date降序排列（NULL值的按创建日期排序）
          query = query.order('lastModified', { ascending: false, nullsFirst: false }).order('date', { ascending: false });
          break;
      }

      const { data, error } = await query.range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

      if (error) throw error;

      if (data.length < pageSize) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(page, currentSort);
  }, [page, currentSort]);

  const handleSortChange = (sortOption: SortOption) => {
    setCurrentSort(sortOption);
    setPage(1); // 重置到第一页
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className='pt-[120px]'>
      <PostSort currentSort={currentSort} onSortChange={handleSortChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link 
            href={`/post/${post.slug}`}
            className="block group"
            key={post.slug}
          >
            <article className="bg-grid-card rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:transform group-hover:scale-[1.02] border border-sky-200 dark:border-sky-800 group-hover:border-sky-400 dark:group-hover:border-sky-500 relative
            rounded-2xl bg-[#181c2a] shadow-[0_0_40px_10px_rgba(59,130,246,0.25)] transition-shadow hover:shadow-[0_0_60px_20px_rgba(59,130,246,0.4)]">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                  <span>{formatPostDate(post.date)}</span>
                  {post.readTime && (
                    <span>· {post.readTime} min read</span>
                  )}
                  {post.lastModified && (
                    <span>· {formatPostDate(post.lastModified)}</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-3 group-hover:text-sky-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-muted-foreground line-clamp-3 mb-4">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-[hsl(var(--tag-bg))] text-[hsl(var(--tag-fg))] dark:bg-sky-900/50 dark:text-sky-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
      
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={handlePrevPage}
          disabled={page === 1 || loading}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors"
        >
          {'<'}
        </button>
        <span className="text-muted-foreground">第 {page} 页</span>
        <button
          onClick={handleNextPage}
          disabled={!hasMore || loading}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sky-700 transition-colors"
        >
          {'>'}
        </button>
      </div>
      
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
        </div>
      )}
    </div>
  );
} 