'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ImagePreview from '@/components/ui/image-preview';
import TableOfContents from '@/components/ui/table-of-contents';
import CodeBlock from '@/components/code-block';
import Comments from '@/components/comments';
import { formatPostDate } from '@/lib/utils';
import ScrollToTop from '@/components/scroll-to-top';

interface Post {
  id: number;
  slug: string;
  title: string;
  content: string;
  date: string;
  author: string;
  readTime: number | null;
  tags: string[];
  lastModified?: string | null;
  github_url: string;
}

interface NavigationPost {
  slug: string;
  title: string;
}

interface PostContentProps {
  post: Post;
  prevPost: NavigationPost | null;
  nextPost: NavigationPost | null;
}

export default function PostContent({ post, prevPost, nextPost }: PostContentProps) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);

  const pathname = usePathname();

  // 判断是否为 /write 页面
  const isWritePage = pathname === '/write' || pathname.startsWith('/write?');

  // 自定义标题渲染器，为标题添加ID
  const createHeadingRenderer = (level: number) => {
    const HeadingRenderer = (props: React.PropsWithChildren<React.HTMLAttributes<HTMLHeadingElement>>) => {
      let text = String(props.children);
      
      // 移除Markdown语法符号，与目录组件保持一致
      text = text
        .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // 移除 ***text*** 格式
        .replace(/\*\*(.*?)\*\*/g, '$1')     // 移除 **text** 格式
        .replace(/\*(.*?)\*/g, '$1')         // 移除 *text* 格式
        .replace(/`(.*?)`/g, '$1')           // 移除 `text` 格式
        .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // 移除 [text](url) 格式
        .replace(/^\d+\.\s*/, '')            // 移除开头的数字和点，如 "1. "
        .replace(/^\d+\)\s*/, '')            // 移除开头的数字和括号，如 "1) "
        .trim();
      
      const baseId = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      const { children, ...restProps } = props;
      
      switch (level) {
        case 1:
          return <h1 id={baseId} className="scroll-mt-24" {...restProps}>{children}</h1>;
        case 2:
          return <h2 id={baseId} className="scroll-mt-24" {...restProps}>{children}</h2>;
        case 3:
          return <h3 id={baseId} className="scroll-mt-24" {...restProps}>{children}</h3>;
        case 4:
          return <h4 id={baseId} className="scroll-mt-24" {...restProps}>{children}</h4>;
        case 5:
          return <h5 id={baseId} className="scroll-mt-24" {...restProps}>{children}</h5>;
        case 6:
          return <h6 id={baseId} className="scroll-mt-24" {...restProps}>{children}</h6>;
        default:
          return <h1 id={baseId} className="scroll-mt-24" {...restProps}>{children}</h1>;
      }
    };

    // 添加 displayName
    HeadingRenderer.displayName = `HeadingRenderer${level}`;
    
    return HeadingRenderer;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthorized(!!session);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const ImageRenderer: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ src, alt }) => {
    const handleClick = () => {
      if (typeof src === 'string') {
        setPreviewImageUrl(src);
      }
    };

    if (!src) return null;
    
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img 
        src={src} 
        alt={alt} 
        onClick={handleClick}
        className="cursor-pointer"
      />
    );
  };

  // 处理目录收缩状态变化
  const handleTocCollapsed = (collapsed: boolean) => {
    setIsTocCollapsed(collapsed);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground py-8 ${isWritePage ? 'pt-8' : 'pt-[120px]'}`}>
      <div className="container mx-auto px-4">
        {/* 文章内容 - 为固定目录留出空间 */}
        <div className={`transition-all duration-300 ${
          isMobile ? '' : isTocCollapsed ? 'ml-20' : 'ml-80'
        }`}>
          <article className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg p-8">
            <header className="mb-8">
              <div className="flex justify-between items-start">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {post.title}
                </h1>
                {isAuthorized && (
                  <>
                    {/* 桌面端：原按钮 */}
                    {!isMobile && (
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
                    {/* 移动端：仅边框图标 */}
                    {isMobile && (
                      <Link
                        href={`/write?edit=${post.slug}`}
                        className="w-10 h-10 flex items-center justify-center border-2 border-sky-600 rounded-lg hover:bg-sky-900 transition-colors"
                        aria-label="编辑该文章"
                      >
                        <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                    )}
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground mt-2">
                <span>发布于: {formatPostDate(post.date)}</span>
                {post.readTime && <span> · {post.readTime} min read</span>}
                {post.lastModified && <span> · 更新于: {formatPostDate(post.lastModified)}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-sm font-medium rounded-full bg-[hsl(var(--tag-bg))] text-[hsl(var(--tag-fg))] dark:bg-sky-900/50 dark:text-sky-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              {/* GitHub 链接展示 */}
              {post.github_url && (
                <div className="mb-2 flex items-center mt-4">
                  <svg className="w-5 h-5 mr-1 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
                  <a
                    href={post.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-500 hover:underline break-all"
                  >
                    查看相关 GitHub 项目
                  </a>
                </div>
              )}
            </header>

            <div className="prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-em:text-muted-foreground prose-blockquote:text-muted-foreground prose-li:text-muted-foreground prose-a:text-sky-400 hover:prose-a:text-sky-300">
              <ReactMarkdown
                components={{ 
                  code: CodeBlock as Components['code'], 
                  img: ImageRenderer,
                  h1: createHeadingRenderer(1),
                  h2: createHeadingRenderer(2),
                  h3: createHeadingRenderer(3),
                  h4: createHeadingRenderer(4),
                  h5: createHeadingRenderer(5),
                  h6: createHeadingRenderer(6),
                }}
                remarkPlugins={[remarkGfm]}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>

        {/* 目录组件 - 固定定位 */}
        <TableOfContents content={post.content} isMobile={isMobile} isTocCollapsed={isTocCollapsed} onTocCollapsed={handleTocCollapsed} />

        {/* 导航按钮 */}
        <div className={`transition-all duration-300 ${
          isMobile ? '' : isTocCollapsed ? 'ml-20' : 'ml-80'
        }`}>
          <div className="max-w-4xl mx-auto mt-12 flex justify-between gap-4">
            {prevPost ? (
              <Link
                href={`/post/${prevPost.slug}`}
                className="flex-1 p-4 bg-card rounded-lg shadow-md hover:bg-accent transition-colors duration-300 group flex items-center justify-between"
              >
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-sky-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                </svg>
                <div className="text-left flex-1">
                  <div className="text-sm text-muted-foreground group-hover:text-sky-400">上一篇</div>
                  <div className="mt-1 font-semibold text-foreground group-hover:text-sky-300">{prevPost.title}</div>
                </div>
              </Link>
            ) : (
              <div className="flex-1"></div>
            )}
            {nextPost ? (
              <Link
                href={`/post/${nextPost.slug}`}
                className="flex-1 p-4 bg-card rounded-lg shadow-md hover:bg-accent transition-colors duration-300 group flex items-center justify-between text-right"
              >
                <div className="text-right flex-1">
                  <div className="text-sm text-muted-foreground group-hover:text-sky-400">下一篇</div>
                  <div className="mt-1 font-semibold text-foreground group-hover:text-sky-300">{nextPost.title}</div>
                </div>
                <svg className="w-5 h-5 text-muted-foreground group-hover:text-sky-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </Link>
            ) : (
              <div className="flex-1"></div>
            )}
          </div>
        </div>

        {/* 评论区 */}
        <div className={`transition-all duration-300 ${
          isMobile ? '' : isTocCollapsed ? 'ml-20' : 'ml-80'
        }`}>
          <Comments postSlug={post.slug} />
        </div>
      </div>
      <ImagePreview imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
      <ScrollToTop />
    </div>
  );
} 