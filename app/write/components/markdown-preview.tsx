'use client'
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/code-block';
import ImageRenderer from '@/components/image-renderer';

interface MarkdownPreviewProps {
  content: string;
  onImageClick?: (src: string) => void;
  className?: string;
}

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  content, 
  onImageClick,
  className = ''
}) => {
  const components: Components = {
    code: CodeBlock as Components['code'],
    img: (props) => <ImageRenderer {...props} onImageClick={onImageClick} />,
  };

  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview; 