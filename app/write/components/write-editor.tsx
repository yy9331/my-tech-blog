'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useEditor } from '../context';
import { useMobileDetection } from '@/lib/hooks/use-mobile-detection';
import { useScrollSync } from '@/lib/hooks/use-scroll-sync';
import { useSaveShortcut } from '@/lib/hooks/use-save-shortcut';
import { useRouter } from 'next/navigation';
import { useArticleData } from '@/lib/hooks/use-article-data';
import ViewModeTabs, { ViewMode } from '@/components/view-mode-tabs';
import SaveButton from '@/components/save-button';
import ScrollToTop from '@/components/scroll-to-top';
import MarkdownPreview from './markdown-preview';
import SplitView from './split-view';
import FullScreenPreview from './full-screen-preview';
import ImagePreview from '@/components/ui/image-preview';

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

interface WriteEditorProps {
  editSlug: string | null;
  initialPost: Post | null;
}

const WriteEditor: React.FC<WriteEditorProps> = ({ 
  editSlug, 
  initialPost
}) => {
  const { content: markdown, setContent, isSaving, setIsSaving } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [previewFull, setPreviewFull] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  const { isMobile } = useMobileDetection();
  const { syncScroll } = useScrollSync();
  
  const { articleData, isEditing, handleSave } = useArticleData({
    editSlug,
    content: markdown,
    setContent,
    setIsSaving,
    initialPost: initialPost || undefined,
  });
  
  // 撤销/重做历史栈
  const [history, setHistory] = useState<string[]>([markdown]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState(false); // 处理中文输入法

  // 推入历史
  const pushHistory = useCallback((newValue: string) => {
    setHistory(prev => {
      if (prev[prev.length - 1] === newValue) return prev;
      return [...prev, newValue];
    });
    setRedoStack([]);
  }, []);

  // 撤销
  const undo = useCallback(() => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const last = history[history.length - 1];
    const prevValue = history[history.length - 2];
    setHistory(newHistory);
    setRedoStack([last, ...redoStack]);
    setContent(prevValue);
  }, [history, redoStack, setContent]);

  // 重做
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack(redoStack.slice(1));
    setHistory([...history, next]);
    setContent(next);
  }, [history, redoStack, setContent]);

  // 统一内容变更处理
  const handleContentChange = useCallback((eOrValue: React.ChangeEvent<HTMLTextAreaElement> | string) => {
    const value = typeof eOrValue === 'string' ? eOrValue : eOrValue.target.value;
    setContent(value);
    pushHistory(value);
  }, [setContent, pushHistory]);

  // 监听撤销/重做快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isComposing) return;
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const undoKey = (isMac ? e.metaKey : e.ctrlKey) && e.key === 'z' && !e.shiftKey;
      const redoKey = (isMac ? e.metaKey : e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y');
      if (undoKey) {
        e.preventDefault();
        undo();
      }
      if (redoKey) {
        e.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, isComposing]);

  // 处理中文输入法合成
  useEffect(() => {
    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => setIsComposing(false);
    document.addEventListener('compositionstart', handleCompositionStart);
    document.addEventListener('compositionend', handleCompositionEnd);
    return () => {
      document.removeEventListener('compositionstart', handleCompositionStart);
      document.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, []);

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
    <div ref={previewRef} className="w-full p-4 border border-border rounded-lg bg-card text-foreground h-screen overflow-y-auto">
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
      editorRef={editorRef}
      previewRef={previewRef}
      onUndo={undo}
      onRedo={redo}
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
          isEditing={isEditing}
        />
        {!isMobile && <SaveButton isSaving={isSaving} />}
      </div>
      
      {isMobile && <SaveButton isSaving={isSaving} isMobile />}
      
      {/* 编辑器内容区域 */}
      <div className="bg-card rounded-lg shadow-xl">
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
      
      {/* 回到顶部按钮 */}
      {viewMode === 'preview' && (
        <ScrollToTop targetRef={previewRef} />
      )}
      {viewMode === 'split' && (
        <>
          <ScrollToTop 
            targetRef={editorRef} 
            className="bottom-6 right-1/2 transform translate-x-8" 
          />
          <ScrollToTop 
            targetRef={previewRef} 
            className="bottom-6 right-6" 
          />
        </>
      )}
    </div>
  );
};

export default WriteEditor; 