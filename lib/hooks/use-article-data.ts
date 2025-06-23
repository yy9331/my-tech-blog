'use client'
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast/toast-context';

interface ArticleData {
  title: string;
  date: string;
  author: string;
  readTime: number | '';
  tags: string[];
  content: string;
}

interface UseArticleDataProps {
  editSlug: string | null;
  content: string;
  setContent: (content: string) => void;
  setIsSaving: (saving: boolean) => void;
}

export const useArticleData = ({ editSlug, content, setContent, setIsSaving }: UseArticleDataProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    date: '',
    author: '',
    readTime: '',
    tags: [],
    content: '',
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [newlyCreatedTags, setNewlyCreatedTags] = useState<string[]>([]);

  // 从 localStorage 恢复未保存的文章
  useEffect(() => {
    const unsavedPostJson = localStorage.getItem('unsavedPost');
    if (unsavedPostJson) {
      try {
        const post = JSON.parse(unsavedPostJson);
        setArticleData({
          title: post.title || '',
          date: post.date || '',
          author: post.author || '',
          readTime: post.readTime || '',
          tags: post.tags || [],
          content: post.content || '',
        });
        setContent(post.content || '');
        localStorage.removeItem('unsavedPost');
      } catch (e) {
        console.error('无法从 localStorage 解析未保存的文章', e);
        localStorage.removeItem('unsavedPost');
      }
    }
  }, [setContent]);

  // 获取编辑的文章数据
  useEffect(() => {
    const fetchPost = async () => {
      if (!editSlug || localStorage.getItem('unsavedPost')) return;

      try {
        const { data: post, error: fetchError } = await createClient()
          .from('Post')
          .select('*')
          .eq('slug', editSlug)
          .single();

        if (fetchError) throw fetchError;

        if (post) {
          setArticleData({
            title: post.title,
            date: post.date,
            author: post.author,
            readTime: post.readTime || '',
            tags: post.tags || [],
            content: post.content,
          });
          setContent(post.content);
          setIsEditing(true);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      }
    };

    fetchPost();
  }, [editSlug, setContent]);

  const updateArticleData = (field: keyof ArticleData, value: string | number | string[]) => {
    setArticleData(prev => ({ ...prev, [field]: value }));
  };

  const handleNewTagCreated = (newTag: string) => {
    if (!newlyCreatedTags.includes(newTag)) {
      setNewlyCreatedTags(prev => [...prev, newTag]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const postData = { ...articleData, content };
      localStorage.setItem('unsavedPost', JSON.stringify(postData));

      const redirectUrl = `/write${editSlug ? `?edit=${editSlug}` : ''}`;
      router.push(`/auth/login?redirect=${encodeURIComponent(redirectUrl)}`);
      setIsSaving(false);
      return;
    }

    try {
      if (newlyCreatedTags.length > 0) {
        const tagsToInsert = newlyCreatedTags.map(tag => ({ name: tag }));
        const { error: insertTagsError } = await createClient()
          .from('Tags')
          .upsert(tagsToInsert, { onConflict: 'name', ignoreDuplicates: true });
        
        if (insertTagsError) {
          console.error('Error inserting new tags:', insertTagsError);
        }
      }

      const slug = isEditing ? editSlug : nanoid();
      const { error: insertPostError } = await createClient().from('Post').upsert({
        slug,
        title: articleData.title,
        date: articleData.date,
        author: articleData.author,
        tags: articleData.tags,
        content,
        readTime: articleData.readTime === '' ? null : articleData.readTime,
        lastModified: new Date().toISOString(),
      }, {
        onConflict: 'slug'
      });

      if (insertPostError) throw insertPostError;
      
      localStorage.removeItem('unsavedPost');
      showToast('文章保存成功！', 'success');

    } catch (err: unknown) {
      const errorMessage = '保存失败，请检查网络或联系管理员。';
      if (err && typeof err === 'object' && 'message' in err) {
        console.error('Error saving post:', (err as { message?: string }).message || errorMessage);
      } else {
        console.error('Error saving post:', errorMessage);
      }
      showToast(errorMessage, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    articleData,
    isEditing,
    updateArticleData,
    handleNewTagCreated,
    handleSave,
  };
}; 