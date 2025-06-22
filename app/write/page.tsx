'use client'
import React, { useState, useRef } from 'react';
import { useEditor } from './context';
import { useMobileDetection } from '@/lib/hooks/use-mobile-detection';
import { useScrollSync } from '@/lib/hooks/use-scroll-sync';
import { useSaveShortcut } from '@/lib/hooks/use-save-shortcut';
import ViewModeTabs, { ViewMode } from '@/components/view-mode-tabs';
import SaveButton from '@/components/save-button';
import EditorView from './components/editor-view';
import MarkdownPreview from './components/markdown-preview';
import SplitView from './components/split-view';
import FullScreenPreview from './components/full-screen-preview';
import ImagePreview from '@/components/ui/image-preview';

const MarkdownEditor: React.FC = () => {
  const { content: markdown, setContent, isSaving } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [previewFull, setPreviewFull] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  const { isMobile } = useMobileDetection();
  const { syncScroll } = useScrollSync();
  
  // 使用自定义 hook
  useSaveShortcut(containerRef);

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  // 处理图片点击
  const handleImageClick = (src: string) => {
    setPreviewImageUrl(src);
  };

  // 渲染编辑器视图
  const renderEditorView = () => (
    <EditorView
      content={markdown}
      onContentChange={handleContentChange}
    />
  );

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
      onContentChange={handleContentChange}
      onImageClick={handleImageClick}
      onEditorScroll={() => syncScroll('editor')}
      onPreviewScroll={() => syncScroll('preview')}
      isMobile={isMobile}
    />
  );

  // 根据视图模式渲染内容
  const renderContent = () => {
    switch (viewMode) {
      case 'editor':
        return renderEditorView();
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
        <ViewModeTabs viewMode={viewMode} onViewModeChange={setViewMode} />
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