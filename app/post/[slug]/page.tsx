'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
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

  // 使用 React.use() 解包 params
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setError('文章不存在');
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        
        // 获取当前文章
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

        // 获取上一篇和下一篇文章
        const { data: navigationPosts, error: navError } = await supabase
          .from('Post')
          .select('slug, title')
          .order('date', { ascending: false });

        if (navError) throw navError;

        const currentIndex = navigationPosts.findIndex(p => p.slug === slug);
        if (currentIndex > 0) {
          setNextPost(navigationPosts[currentIndex - 1]);
        }
        if (currentIndex < navigationPosts.length - 1) {
          setPrevPost(navigationPosts[currentIndex + 1]);
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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{error || '文章未找到'}</h1>
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
    <div className="container mx-auto px-4 py-8">
      {/* 返回按钮 */}
      <button
        onClick={() => router.push('/')}
        className="mb-8 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
      >
        返回首页
      </button>

      {/* 文章内容 */}
      <article className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
            <span>{post.date}</span>
            {post.readTime && (
              <span>· {post.readTime} min read</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags?.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm font-medium bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-400 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{ code: CodeBlock as any }}
            remarkPlugins={[remarkGfm]}
          >
            {post.content}
          </ReactMarkdown>
        </div>
      </article>

      {/* 导航按钮 */}
      <div className="max-w-4xl mx-auto mt-12 flex justify-between">
        {prevPost ? (
          <button
            onClick={() => router.push(`/post/${prevPost.slug}`)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            上一篇：{prevPost.title}
          </button>
        ) : (
          <div></div>
        )}
        {nextPost ? (
          <button
            onClick={() => router.push(`/post/${nextPost.slug}`)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            下一篇：{nextPost.title}
          </button>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
} 