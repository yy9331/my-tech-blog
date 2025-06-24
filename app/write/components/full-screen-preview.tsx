'use client'
import React from 'react';
import MarkdownPreview from './markdown-preview';

interface FullScreenPreviewProps {
  content: string;
  onImageClick?: (src: string) => void;
  onClose: () => void;
}

const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  content,
  onImageClick,
  onClose
}) => {
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b border-border p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-foreground">预览</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-accent transition-colors"
        >
          关闭
        </button>
      </div>
      <div className="p-4">
        <MarkdownPreview content={content} onImageClick={onImageClick} />
      </div>
    </div>
  );
};

export default FullScreenPreview; 