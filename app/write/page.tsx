'use client'
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
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
  console.log(codeContent)
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
  }, []);

  const renderMarkdown = () => (
    <div className="prose dark:prose-invert max-w-none">
      <ReactMarkdown
        components={{ code: CodeBlock as any }}
        remarkPlugins={[remarkGfm]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Tab 切换栏 */}
      <div className="flex space-x-4 mb-4">
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
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor;