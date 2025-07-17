'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import ScrollToTop from '@/components/scroll-to-top';

interface TagData {
  tag: string;
  count: number;
}

export default function CategoriesPage() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('Post')
          .select('tags');

        if (error) throw error;

        const tagCounts: { [key: string]: number } = {};
        data.forEach(post => {
          post.tags.forEach((tag: string) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        });

        const sortedTags = Object.entries(tagCounts)
          .map(([tag, count]) => ({ tag, count }))
          .sort((a, b) => b.count - a.count);

        setTags(sortedTags);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('加载分类时出错。');
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center text-foreground pt-[66px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center text-foreground pt-[66px]">
        <p className="text-xl text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid text-foreground py-8 pt-24">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-foreground">文章分类</h1>
        
        {tags.length === 0 ? (
          <p className="text-muted-foreground">暂无分类。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tags.map((tagData) => (
              <Link 
                href={`/categories/${tagData.tag}`}
                key={tagData.tag}
                className="block p-6 bg-card rounded-lg shadow-lg hover:bg-accent transition-colors duration-300 group"
              >
                <h2 className="text-xl font-semibold text-sky-400 mb-2 group-hover:text-sky-300">
                  {tagData.tag}
                </h2>
                <p className="text-muted-foreground text-sm">共 {tagData.count} 篇文章</p>
              </Link>
            ))}
          </div>
        )}
      </div>
      <ScrollToTop />
    </div>
  );
} 