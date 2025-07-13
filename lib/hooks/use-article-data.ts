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
  github_url: string;
}

interface UseArticleDataProps {
  editSlug: string | null;
  content: string;
  setContent: (content: string) => void;
  setIsSaving: (saving: boolean) => void;
  initialPost?: {
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
  };
}

export const useArticleData = ({ editSlug, content, setContent, setIsSaving, initialPost }: UseArticleDataProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [articleData, setArticleData] = useState<ArticleData>({
    title: '',
    date: '',
    author: '',
    readTime: '',
    tags: [],
    content: '',
    github_url: '',
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
          github_url: post.github_url || '',
        });
        setContent(post.content || '');
        localStorage.removeItem('unsavedPost');
      } catch (e) {
        console.error('无法从 localStorage 解析未保存的文章', e);
        localStorage.removeItem('unsavedPost');
      }
    }
  }, [setContent]);

  // 使用服务器端获取的初始数据
  useEffect(() => {
    if (initialPost && !localStorage.getItem('unsavedPost')) {
      setArticleData({
        title: initialPost.title || '',
        date: initialPost.date || '',
        author: initialPost.author || '',
        readTime: initialPost.readTime || '',
        tags: initialPost.tags || [],
        content: initialPost.content || '',
        github_url: initialPost.github_url || '',
      });
      setContent(initialPost.content || '');
      setIsEditing(true);
    }
  }, [initialPost, setContent]);

  // 获取编辑的文章数据（仅在没有初始数据时执行）
  useEffect(() => {
    const fetchPost = async () => {
      if (!editSlug || localStorage.getItem('unsavedPost') || initialPost) return;

      try {
        const { data: post, error: fetchError } = await createClient()
          .from('Post')
          .select('*')
          .eq('isShown', true)
          .eq('slug', editSlug)
          .single();

        if (fetchError) {
          // 如果是文章不存在的错误，这是新文章，清空内容
          if (fetchError.code === 'PGRST116') {
            setArticleData({
              title: '',
              date: '',
              author: '',
              readTime: '',
              tags: [],
              content: '',
              github_url: '',
            });
            setContent('');
            setIsEditing(false);
            setNewlyCreatedTags([]);
            return;
          }
          // 其他错误才抛出
          throw fetchError;
        }

        if (post) {
          setArticleData({
            title: post.title,
            date: post.date,
            author: post.author,
            readTime: post.readTime || '',
            tags: post.tags || [],
            content: post.content,
            github_url: post.github_url || '',
          });
          setContent(post.content);
          setIsEditing(true);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      }
    };

    fetchPost();
  }, [editSlug, setContent, initialPost]);

  // 为新文章生成 slug 并更新 URL
  useEffect(() => {
    // 如果没有 editSlug 且不是从 localStorage 恢复的，生成新的 slug
    if (!editSlug && !localStorage.getItem('unsavedPost')) {
      const newSlug = nanoid();
      const newUrl = `/write?edit=${newSlug}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [editSlug]);

  // 当直接访问 /write 页面时，清除旧的编辑状态并生成新的 slug
  useEffect(() => {
    // 检查是否是从其他页面直接跳转到 /write
    const isDirectWriteAccess = !localStorage.getItem('unsavedPost') && 
                               !localStorage.getItem('lastEditSlug') && 
                               window.location.pathname === '/write';
    
    if (isDirectWriteAccess) {
      // 清空所有文章数据
      setArticleData({
        title: '',
        date: '',
        author: '',
        readTime: '',
        tags: [],
        content: '',
        github_url: '',
      });
      setContent('');
      setIsEditing(false);
      setNewlyCreatedTags([]);
      
      // 生成新的 slug 并更新 URL
      const newSlug = nanoid();
      const newUrl = `/write?edit=${newSlug}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [setContent]);

  // 记录当前编辑的 slug，用于判断是否是从编辑页面跳转
  useEffect(() => {
    if (editSlug) {
      localStorage.setItem('lastEditSlug', editSlug);
    }
  }, [editSlug]);

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

      // 使用当前的 editSlug 或生成新的 slug
      const slug = editSlug || nanoid();
      
      const { error: insertPostError } = await supabase.from('Post').upsert({
        slug,
        title: articleData.title,
        date: articleData.date,
        author: articleData.author,
        user_id: session.user.id, // 添加用户ID
        tags: articleData.tags,
        content,
        readTime: articleData.readTime === '' ? null : articleData.readTime,
        lastModified: new Date().toISOString(),
        github_url: articleData.github_url,
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