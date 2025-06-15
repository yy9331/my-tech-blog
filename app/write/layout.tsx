'use client'
import React, { useState, useEffect } from 'react';
import TagsMultiSelect from '@/components/tags-multiselect';
import { createClient } from '@/lib/supabase/client';
import { nanoid } from 'nanoid';
import { EditorProvider, useEditor } from './context';
import { useSearchParams, useRouter } from 'next/navigation';

type WriteLayoutProps = {
  children: React.ReactElement<React.ComponentProps<any>>;
}

const WriteLayoutContent = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState<number | ''>('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newlyCreatedTags, setNewlyCreatedTags] = useState<string[]>([]);
  const { content, setContent } = useEditor();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');

  useEffect(() => {
    const fetchInitialTags = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('Tags')
        .select('name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching initial tags:', error);
        throw error;
      }
      setAvailableTags(data.map(item => item.name));
    };

    fetchInitialTags();
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!editSlug) return;

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push(`/auth/login?redirect=/write?edit=${editSlug}`);
        return;
      }
    };

    checkAuth();
  }, [router, editSlug]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!editSlug) return;

      try {
        const { data: post, error: fetchError } = await createClient()
          .from('Post')
          .select('*')
          .eq('slug', editSlug)
          .single();

        if (fetchError) throw fetchError;

        if (post) {
          setTitle(post.title);
          setDate(post.date);
          setAuthor(post.author);
          setReadTime(post.readTime || '');
          setTags(post.tags || []);
          setContent(post.content);
          setIsEditing(true);
          setCollapsed(false);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('加载文章失败');
      }
    };

    fetchPost();
  }, [editSlug, setContent]);

  const handleNewTagCreated = (newTag: string) => {
    if (!availableTags.includes(newTag)) {
      setAvailableTags(prev => [...prev, newTag].sort());
    }
    if (!newlyCreatedTags.includes(newTag)) {
      setNewlyCreatedTags(prev => [...prev, newTag]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

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
        title,
        date,
        author,
        tags,
        content,
        readTime: readTime === '' ? null : readTime,
      }, {
        onConflict: 'slug'
      });

      if (insertPostError) throw insertPostError;
      setSuccess(isEditing ? '更新成功！' : '保存成功！');
      setNewlyCreatedTags([]);
    } catch (err: any) {
      setError(err.message || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-5xl mx-auto pt-8">
        <form onSubmit={handleSave}>
          {/* 折叠表单区 */}
          <div className="mb-6 mt-[66px]">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-t-lg bg-sky-700 hover:bg-sky-600 text-white font-semibold transition-colors w-full justify-between"
              onClick={e => { e.preventDefault(); setCollapsed((c) => !c); }}
              type="button"
            >
              <span>{isEditing ? '编辑文章信息' : '文章信息设置'}</span>
              <svg
                className={`w-5 h-5 transform transition-transform ${collapsed ? '' : 'rotate-180'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`transition-all duration-300 bg-gray-800 rounded-b-lg ${collapsed ? 'max-h-0 py-0 px-0' : 'max-h-[500px] py-6 px-6'}`}
            >
              {!collapsed && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-300 mb-1">标题</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                      placeholder="请输入文章标题"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">日期</label>
                    <input
                      type="date"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">作者</label>
                    <input
                      type="text"
                      value={author}
                      onChange={e => setAuthor(e.target.value)}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                      placeholder="请输入作者名"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-1">预计阅读时间(分钟)</label>
                    <input
                      type="number"
                      min={1}
                      value={readTime}
                      onChange={e => setReadTime(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-3 rounded-lg bg-gray-700 border border-gray-600 text-gray-200 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                      placeholder="如：5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-gray-300 mb-1">标签</label>
                    <TagsMultiSelect
                      options={availableTags}
                      value={tags}
                      onChange={setTags}
                      onNewTagCreated={handleNewTagCreated}
                      placeholder="请选择或输入标签"
                    />
                    <div className="mt-2 text-sm text-sky-400">可多选，输入或选择后回车/点击添加</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* markdown 编辑器内容区 */}
          <div className="bg-gray-800 rounded-lg shadow-xl">
            {children}
          </div>
          {/* 保存按钮和提示 */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
          {error && <div className="mt-4 text-red-400 text-center">{error}</div>}
          {success && <div className="mt-4 text-sky-400 text-center">{success}</div>}
        </form>
      </div>
    </div>
  );
}

const WriteLayout = ({ children }: WriteLayoutProps) => <EditorProvider>
    <WriteLayoutContent>{children}</WriteLayoutContent>
</EditorProvider>;

export default WriteLayout;