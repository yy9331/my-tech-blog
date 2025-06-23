'use client'
import React, { useState, useRef } from 'react';
import { useEditor } from './context';
import { useMobileDetection } from '@/lib/hooks/use-mobile-detection';
import { useScrollSync } from '@/lib/hooks/use-scroll-sync';
import { useSaveShortcut } from '@/lib/hooks/use-save-shortcut';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useArticleData } from '@/lib/hooks/use-article-data';
import ViewModeTabs, { ViewMode } from '@/components/view-mode-tabs';
import SaveButton from '@/components/save-button';
import MarkdownPreview from './components/markdown-preview';
import SplitView from './components/split-view';
import FullScreenPreview from './components/full-screen-preview';
import ImagePreview from '@/components/ui/image-preview';

const MarkdownEditor: React.FC = () => {
  const { content: markdown, setContent, isSaving, setIsSaving } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [previewFull, setPreviewFull] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  const { isMobile } = useMobileDetection();
  const { syncScroll } = useScrollSync();
  
  const editSlug = searchParams.get('edit');
  
  const { articleData, handleSave } = useArticleData({
    editSlug,
    content: markdown,
    setContent,
    setIsSaving,
  });
  
  // 使用自定义 hook
  useSaveShortcut(containerRef);

  // 处理Preview Page - 先保存再跳转
  const handlePreviewPage = async () => {
    if (isSaving) return; // 如果正在保存，不执行操作
    
    setIsSaving(true);
    
    try {
      // 创建一个模拟的form事件来触发保存
      const mockEvent = {
        preventDefault: () => {},
      } as React.FormEvent;
      
      await handleSave(mockEvent);
      
      // 保存成功后跳转到预览页面
      if (editSlug) {
        router.push(`/post/${editSlug}`);
      } else {
        // 如果是新文章，需要等待保存完成后获取slug
        // 这里可以添加一个延迟或者监听保存状态
        setTimeout(() => {
          if (articleData.title) {
            // 使用标题生成一个临时的slug进行预览
            const tempSlug = articleData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            router.push(`/post/${tempSlug}`);
          }
        }, 1000);
      }
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // 处理图片点击
  const handleImageClick = (src: string) => {
    setPreviewImageUrl(src);
  };

  // 渲染预览视图
  const renderPreviewView = () => (
    <div className="w-full p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600">
      <MarkdownPreview content={markdown} onImageClick={handleImageClick} />
    </div>
  );

  // 渲染分屏视图
  const renderSplitView = () => (
    <SplitView
      content={markdown}
      onContentChange={(e) => setContent(e.target.value)}
      onImageClick={handleImageClick}
      onEditorScroll={() => syncScroll('editor')}
      onPreviewScroll={() => syncScroll('preview')}
      isMobile={isMobile}
    />
  );

  // 根据视图模式渲染内容
  const renderContent = () => {
    switch (viewMode) {
      case 'preview':
        return renderPreviewView();
      case 'split':
        return renderSplitView();
      default:
        return renderSplitView();
    }
  };

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <ViewModeTabs 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
          onPreviewPage={handlePreviewPage}
        />
        {!isMobile && <SaveButton isSaving={isSaving} />}
      </div>
      
      {isMobile && <SaveButton isSaving={isSaving} isMobile />}
      
      {/* 编辑器内容区域 */}
      <div className="bg-gray-800 rounded-lg shadow-xl">
        {renderContent()}
      </div>

      {/* 全屏预览 */}
      {previewFull && (
        <FullScreenPreview
          content={markdown}
          onImageClick={handleImageClick}
          onClose={() => setPreviewFull(false)}
        />
      )}
      
      {/* 图片预览 */}
      <ImagePreview imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
    </div>
  );
};

export default MarkdownEditor;