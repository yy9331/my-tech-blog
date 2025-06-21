'use client'
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown, { Components }  from 'react-markdown';
import 'highlight.js/styles/github-dark.min.css';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEditor } from './context';
import ImagePreview from '@/components/ui/image-preview';

// -- Custom Hook for Save Shortcut --
const useSaveShortcut = (formRef: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const saveKeyPressed = (isMac ? event.metaKey : event.ctrlKey) && event.key === 's';

      if (saveKeyPressed) {
        event.preventDefault();
        const form = formRef.current?.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [formRef]);
};

// 视图模式类型定义
type ViewMode = 'editor' | 'preview' | 'split';

// 自定义代码块渲染器，用于代码高亮
const CodeBlock = ({ className, children }: {
  className?: string;
  children: React.ReactNode;
}) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  const codeContent = String(children || '').replace(/\n$/, '');
  return (
    <SyntaxHighlighter
      language={language}
      style={vscDarkPlus}
      showLineNumbers={true}
      customStyle={{
        margin: 0,
        borderRadius: '0.5rem',
        padding: '1em',
        background: 'none',
      }}
    >
      {codeContent}
    </SyntaxHighlighter>
  );
};

// 主组件
const MarkdownEditor: React.FC = () => {
  const { content: markdown, setContent, isSaving } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isMobile, setIsMobile] = useState(false);
  const [previewFull, setPreviewFull] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  
  // 使用自定义 hook
  useSaveShortcut(containerRef);

  // 处理 Tab 切换
  const handleTabChange = (newMode: ViewMode) => {
    setViewMode(newMode);
  };

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
  };

  // 设置初始内容
  useEffect(() => {
    if (!markdown) {
      setContent('');
    }
  }, [markdown, setContent]);

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

  const renderMarkdown = () => (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{ code: CodeBlock as Components['code'], img: ImageRenderer }}
        remarkPlugins={[remarkGfm]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="container mx-auto p-4" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-4">
          {['editor', 'preview', 'split'].map((mode) => (
            <button
              key={mode}
              type="button"
              className={`px-4 py-2 border rounded ${
                viewMode === mode ? 'bg-sky-700 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300'
              }`}
              onClick={() => handleTabChange(mode as ViewMode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        {!isMobile && (
          <div className="flex items-center space-x-4">
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>
      {isMobile && (
        <button
          type="submit"
          className="fixed bottom-6 right-6 z-50 px-8 py-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-lg font-bold shadow-lg transition-colors disabled:opacity-60"
          disabled={isSaving}
        >
          {isSaving ? '保存中...' : '保存'}
        </button>
      )}
      {/* 编辑器内容区域 */}
      <div className="bg-gray-800 rounded-lg shadow-xl">
        {/* 根据视图模式渲染内容 */}
        {viewMode === 'editor' && (
          <textarea
            className="w-full h-64 p-4 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 h-screen"
            value={markdown}
            onChange={handleContentChange}
            placeholder="请输入正文..."
          />
        )}

        {viewMode === 'preview' && (
          <div className="w-full p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600">
            {renderMarkdown()}
          </div>
        )}

        {viewMode === 'split' && (
          isMobile ? (
            <div className="flex flex-col space-y-4 relative">
              {/* 右上角全屏预览按钮 */}
              <button
                type="button"
                className="absolute top-2 right-2 z-10 px-3 py-1 bg-white border border-gray-300 rounded shadow text-sky-700 text-sm font-semibold flex items-center gap-1"
                onClick={() => setPreviewFull(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2"/></svg>
                全屏预览
              </button>
              <textarea
                className="w-full h-48 p-4 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600"
                value={markdown}
                onChange={handleContentChange}
                placeholder="请输入正文..."
              />
              <div className="w-full p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 h-48 overflow-y-auto">
                {renderMarkdown()}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <textarea
                className="w-full p-4 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 h-screen"
                value={markdown}
                onChange={handleContentChange}
                placeholder="请输入正文..."
              />
              <div className="p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 h-screen overflow-y-auto">
                {renderMarkdown()}
              </div>
            </div>
          )
        )}
      </div>

      {previewFull && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">预览</h2>
            <button
              onClick={() => setPreviewFull(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              关闭
            </button>
          </div>
          <div className="p-4">
            {renderMarkdown()}
          </div>
        </div>
      )}
      <ImagePreview imageUrl={previewImageUrl} onClose={() => setPreviewImageUrl(null)} />
    </div>
  );
};

export default MarkdownEditor;