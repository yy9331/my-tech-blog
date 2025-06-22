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
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">预览</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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