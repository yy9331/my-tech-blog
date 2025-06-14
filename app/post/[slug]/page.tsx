'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  date: string;
  readTime: number | null;
  tags: string[];
}

interface NavigationPost {
  slug: string;
  title: string;
}

const CodeBlock = ({ 
  inline, 
  className, 
  children 
}: {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (inline) {
    return <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{children}</code>;
  }

  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      showLineNumbers={true}
      customStyle={{
        margin: '1em 0',
        borderRadius: '0.5rem',
        padding: '1em',
      }}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  );
};

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [prevPost, setPrevPost] = useState<NavigationPost | null>(null);
  const [nextPost, setNextPost] = useState<NavigationPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthorized(!!session);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('文章不存在');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        const { data: currentPost, error: currentError } = await supabase
          .from('Post')
          .select('*')
          .eq('slug', slug)
          .single();

        if (currentError) {
          if (currentError.code === 'PGRST116') {
            setError('文章不存在');
          } else {
            throw currentError;
          }
          setLoading(false);
          return;
        }

        if (!currentPost) {
          setError('文章不存在');
          setLoading(false);
          return;
        }

        setPost(currentPost);

        const { data: navigationPosts, error: navError } = await supabase
          .from('Post')
          .select('slug, title')
          .order('date', { ascending: false });

        if (navError) throw navError;

        const currentIndex = navigationPosts.findIndex(p => p.slug === slug);

        // 根据排序方式（日期降序）：
        // 上一篇（更早的文章，在数组中索引更大）
        if (currentIndex < navigationPosts.length - 1) {
          setPrevPost(navigationPosts[currentIndex + 1]);
        }
        // 下一篇（更晚的文章，在数组中索引更小）
        if (currentIndex > 0) {
          setNextPost(navigationPosts[currentIndex - 1]);
        }

      } catch (error) {
        console.error('Error fetching post:', error);
        setError('加载文章时出错');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-100">{error || '文章未找到'}</h1>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-8">
      <div className="container mx-auto px-4">
        {/* 返回按钮 */}
        <button
          onClick={() => router.push('/')}
          className="mb-8 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          返回首页
        </button>

        {/* 文章内容 */}
        <article className="max-w-4xl mx-auto bg-gray-800 rounded-lg shadow-lg p-8">
          <header className="mb-8">
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-bold text-white mb-4">
                {post.title}
              </h1>
              {isAuthorized && (
                <Link
                  href={`/write?edit=${post.slug}`}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑该文章
                </Link>
              )}
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <span>{post.date}</span>
              {post.readTime && (
                <span>· {post.readTime} min read</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-sm font-medium bg-sky-900/50 text-sky-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="prose dark:prose-invert max-w-none prose-headings:text-white prose-p:text-gray-200 prose-strong:text-white prose-em:text-gray-200 prose-blockquote:text-gray-300 prose-li:text-gray-200 prose-a:text-sky-400 hover:prose-a:text-sky-300">
            <ReactMarkdown
              components={{ code: CodeBlock as any }}
              remarkPlugins={[remarkGfm]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* 导航按钮 */}
        <div className="max-w-4xl mx-auto mt-12 flex justify-between gap-4">
          {prevPost ? (
            <Link
              href={`/post/${prevPost.slug}`}
              className="flex-1 p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300 group flex items-center justify-between"
            >
              <svg className="w-5 h-5 text-gray-300 group-hover:text-sky-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              <div className="text-left flex-1">
                <div className="text-sm text-gray-300 group-hover:text-sky-400">上一篇</div>
                <div className="mt-1 font-semibold text-gray-100 group-hover:text-sky-300">{prevPost.title}</div>
              </div>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
          {nextPost ? (
            <Link
              href={`/post/${nextPost.slug}`}
              className="flex-1 p-4 bg-gray-800 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300 group flex items-center justify-between text-right"
            >
              <div className="text-right flex-1">
                <div className="text-sm text-gray-300 group-hover:text-sky-400">下一篇</div>
                <div className="mt-1 font-semibold text-gray-100 group-hover:text-sky-300">{nextPost.title}</div>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-sky-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          ) : (
            <div className="flex-1"></div>
          )}
        </div>
      </div>
    </div>
  );
} 