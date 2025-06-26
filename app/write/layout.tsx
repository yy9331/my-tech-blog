'use client'
import React, { useState, Suspense } from 'react';
import { EditorProvider, useEditor } from './context';
import { useSearchParams } from 'next/navigation';
import { useArticleData } from '@/lib/hooks/use-article-data';
import { useTags } from '@/lib/hooks/use-tags';
import CollapsibleForm from './components/collapsible-form';

type WriteLayoutProps = {
  children: React.ReactElement;
}

const WriteLayoutContent = ({ children }: { children: React.ReactElement }) => {
  const [collapsed, setCollapsed] = useState(true);
  const { content, setContent, setIsSaving } = useEditor();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get('edit');

  const { articleData, isEditing, updateArticleData, handleNewTagCreated, handleSave } = useArticleData({
    editSlug,
    content,
    setContent,
    setIsSaving,
  });

  const { availableTags, tagsLoading, addNewTag } = useTags();

  const handleNewTagCreatedWithUpdate = (newTag: string) => {
    handleNewTagCreated(newTag);
    addNewTag(newTag);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSave}>
          <CollapsibleForm
            collapsed={collapsed}
            isEditing={isEditing}
            title={articleData.title}
            date={articleData.date}
            author={articleData.author}
            readTime={articleData.readTime}
            tags={articleData.tags}
            availableTags={availableTags}
            tagsLoading={tagsLoading}
            editSlug={editSlug}
            onCollapsedChange={setCollapsed}
            onTitleChange={(value) => updateArticleData('title', value)}
            onDateChange={(value) => updateArticleData('date', value)}
            onAuthorChange={(value) => updateArticleData('author', value)}
            onReadTimeChange={(value) => updateArticleData('readTime', value)}
            onTagsChange={(value) => updateArticleData('tags', value)}
            onNewTagCreated={handleNewTagCreatedWithUpdate}
          />
          {/* markdown 编辑器内容区 */}
          <div className="bg-card rounded-lg shadow-xl">
            {children}
          </div>
        </form>
      </div>
    </div>
  );
}

const WriteLayout = ({ children }: WriteLayoutProps) => (
  <EditorProvider>
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-sky-400 text-xl">加载中...</div>
    </div>}>
      <WriteLayoutContent>{children}</WriteLayoutContent>
    </Suspense>
  </EditorProvider>
);

export default WriteLayout;