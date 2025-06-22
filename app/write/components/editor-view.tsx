'use client'
import React from 'react';

interface EditorViewProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onScroll?: () => void;
  className?: string;
  placeholder?: string;
}

const EditorView: React.FC<EditorViewProps> = ({
  content,
  onContentChange,
  onScroll,
  className = '',
  placeholder = '请输入正文...'
}) => {
  return (
    <textarea
      data-editor
      onScroll={onScroll}
      className={`w-full p-4 border border-gray-300 rounded-lg dark:bg-gray-800 dark:text-white dark:border-gray-600 h-screen ${className}`}
      value={content}
      onChange={onContentChange}
      placeholder={placeholder}
    />
  );
};

export default EditorView; 