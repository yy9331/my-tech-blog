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
    code: (props) => {
      const { className, children, ...rest } = props;
      const inline = (rest as { inline?: boolean }).inline;
      return (
        <CodeBlock 
          className={className} 
          inline={inline}
          {...rest}
        >
          {children}
        </CodeBlock>
      );
    },
    img: (props) => <ImageRenderer {...props} onImageClick={onImageClick} />,
  };

  return (
    <div className={`prose dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-em:text-muted-foreground prose-blockquote:text-muted-foreground prose-li:text-muted-foreground prose-a:text-sky-400 hover:prose-a:text-sky-300 ${className}`}>
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