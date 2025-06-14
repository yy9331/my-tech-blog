'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  date: string;
  readTime: number | null;
  tags: string[];
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 12;

  const loadPosts = async (pageNum: number) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('Post')
        .select('id, slug, title, content, date, readTime, tags')
        .order('date', { ascending: false })
        .range((pageNum - 1) * pageSize, pageNum * pageSize - 1);

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
    loadPosts(page);
  }, [page]);

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
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link 
            href={`/post/${post.slug}`}
            className="block group"
            key={post.slug}
          >
            <article className="bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:transform group-hover:scale-[1.02]">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-400">{post.date}</span>
                  {post.readTime && (
                    <span className="text-sm text-gray-400">· {post.readTime} min read</span>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-white mb-3 group-hover:text-sky-400 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 line-clamp-3 mb-4">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag: string) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 text-xs font-medium bg-sky-900/50 text-sky-400 rounded-full"
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
        <span className="text-gray-400">第 {page} 页</span>
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