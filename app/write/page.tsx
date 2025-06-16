'use client'
import React, { useState, useEffect } from 'react';
import ReactMarkdown, { Components }  from 'react-markdown';
import 'highlight.js/styles/github-dark.min.css';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useEditor } from './context';

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
  const { content: markdown, setContent } = useEditor();
  
  // 控制当前视图模式
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [previewFull, setPreviewFull] = useState(false);

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

  // 处理保存按钮点击
  const handleSave = async () => {
    setLoading(true);
    try {
      // 这里添加保存逻辑
      if (isMobile) {
        setToast({ type: 'success', message: '保存成功！' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setSuccess('保存成功！');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      if (isMobile) {
        setToast({ type: 'error', message: '保存失败' });
        setTimeout(() => setToast(null), 3000);
      } else {
        setError('保存失败');
        setTimeout(() => setError(''), 4000);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = () => (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{ code: CodeBlock as Components['code'] }}
        remarkPlugins={[remarkGfm]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* 移动端 Toast 提示 */}
      {isMobile && toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border border-gray-200 bg-white text-gray-900 min-w-[200px] max-w-[90vw]" style={{boxShadow:'0 2px 8px rgba(0,0,0,0.12)'}}>
          {toast.type === 'success' ? (
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4" stroke="green"/></svg>
          ) : (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 9l-6 6m0-6l6 6" stroke="red"/></svg>
          )}
          <span className="text-base font-medium">{toast.message}</span>
        </div>
      )}
      {/* Tab 切换栏和保存按钮 */}
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
        {/* 桌面端保存按钮 */}
        {!isMobile && (
          <div className="flex items-center space-x-4">
            {error && <div className="text-red-400">{error}</div>}
            {success && <div className="text-sky-400">{success}</div>}
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>
      {/* 移动端悬浮保存按钮 */}
      {isMobile && (
        <button
          onClick={handleSave}
          className="fixed bottom-6 right-6 z-50 px-8 py-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-lg font-bold shadow-lg transition-colors disabled:opacity-60"
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
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
              <div className="w-full p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600">
                {renderMarkdown()}
              </div>
              {/* 预览全屏弹窗 */}
              {previewFull && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex flex-col">
                  <div className="flex justify-end p-4">
                    <button
                      className="px-4 py-2 bg-white text-sky-700 rounded shadow font-semibold"
                      onClick={() => setPreviewFull(false)}
                    >关闭预览</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg max-w-2xl mx-auto">
                      {renderMarkdown()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-4">
              <textarea
                className="w-1/2 h-64 p-4 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 h-screen"
                value={markdown}
                onChange={handleContentChange}
                placeholder="请输入正文..."
              />
              <div className="w-1/2 p-4 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600">
                {renderMarkdown()}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;