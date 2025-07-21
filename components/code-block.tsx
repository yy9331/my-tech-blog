'use client'
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Mermaid from './mermaid-flowchart';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
  inline?: boolean;
  [key: string]: unknown; // 允许其他属性
}

const CodeBlock: React.FC<CodeBlockProps> = ({ className, children, inline, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children || '').replace(/\n$/, '');

  if (match && match[1] === "mermaid") {
    return <Mermaid chart={String(children).trim()} />;
  }

  // 如果是行内代码（inline 为 true 或者没有 className），使用行内样式
  if (inline || !className) {
    return (
      <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono before:content-[''] after:content-['']" {...props}>
        {codeContent}
      </code>
    );
  }

  // 如果是块级代码块，使用语法高亮
  return (
    <div className="my-4 rounded-md border border-border overflow-hidden">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          padding: '1.25rem 1rem',
          // 让 vscDarkPlus 主题接管背景色
        }}
        codeTagProps={{
          style: {
            fontFamily: '"Fira Code", monospace',
            fontSize: '0.875rem'
          }
        }}
      >
        {codeContent}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock; 