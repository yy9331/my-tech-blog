import Link from 'next/link';

export default function BlogPage() {
  // 模拟博客文章数据
  const posts = [
    {
      id: 1,
      title: "Next.js 15 新特性介绍",
      excerpt: "探索 Next.js 15 带来的激动人心的新功能...",
      date: "2024-03-20",
      slug: "nextjs-15-features",
      category: "技术"
    },
    {
      id: 2,
      title: "React Server Components 详解",
      excerpt: "深入了解 React Server Components 的工作原理...",
      date: "2024-03-19",
      slug: "react-server-components",
      category: "技术"
    },
    {
      id: 3,
      title: "TypeScript 最佳实践",
      excerpt: "学习 TypeScript 开发中的最佳实践和技巧...",
      date: "2024-03-18",
      slug: "typescript-best-practices",
      category: "技术"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 页面标题区域 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">博客文章</h1>
        <p className="text-lg text-gray-600">探索最新的技术文章和教程</p>
      </div>
      
      {/* 文章列表 */}
      <div className="grid gap-8">
        {posts.map((post) => (
          <article 
            key={post.id} 
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
          >
            <div className="p-6">
              {/* 文章分类标签 */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                  {post.category}
                </span>
              </div>

              {/* 文章标题 */}
              <h2 className="text-2xl font-bold mb-3">
                <Link 
                  href={`/blog/${post.slug}`}
                  className="text-gray-900 hover:text-blue-600 transition-colors duration-200"
                >
                  {post.title}
                </Link>
              </h2>

              {/* 文章摘要 */}
              <p className="text-gray-600 mb-4 line-clamp-2">
                {post.excerpt}
              </p>

              {/* 文章元信息 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {post.date}
                  </span>
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    5 分钟阅读
                  </span>
                </div>
                
                {/* 阅读更多按钮 */}
                <Link 
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  阅读更多
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
} 