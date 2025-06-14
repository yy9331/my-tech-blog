'use client';

import { useEffect, useState, use } from 'react';
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

export default function TagPostsPage({ params }: { params: Promise<{ tag: string }> }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedParams = use(params);
  const encodedTag = resolvedParams.tag;
  const tag = decodeURIComponent(encodedTag);

  useEffect(() => {
    const fetchPostsByTag = async () => {
      if (!tag) {
        setError('标签不存在。');
        setLoading(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('Post')
          .select('id, slug, title, content, date, readTime, tags')
          .contains('tags', [tag]) // 使用 contains 操作符查询数组
          .order('date', { ascending: false });

        if (error) throw error;

        setPosts(data);
      } catch (err) {
        console.error(`Error fetching posts for tag ${tag}:`, err);
        setError(`加载标签为 "${tag}" 的文章时出错。`);
      } finally {
        setLoading(false);
      }
    };

    fetchPostsByTag();
  }, [tag]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center text-gray-100">
        <p className="text-xl text-red-500">{error}</p>
        <Link href="/categories" className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors">
          返回分类列表
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <div className="container mx-auto px-4">
        <Link href="/categories" className="mb-8 inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          返回分类列表
        </Link>
        <h1 className="text-3xl font-bold mb-8 text-white mt-4">标签: {tag}</h1>
        
        {posts.length === 0 ? (
          <p className="text-gray-400">暂无标签为 "{tag}" 的文章。</p>
        ) : (
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
                        {post.tags?.map((t: string) => (
                        <span 
                            key={t}
                            className="px-2 py-1 text-xs font-medium bg-sky-900/50 text-sky-400 rounded-full"
                        >
                            {t}
                        </span>
                        ))}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 