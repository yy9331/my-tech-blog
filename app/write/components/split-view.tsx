'use client'
import React from 'react';
import EditorView from './editor-view';
import MarkdownPreview from './markdown-preview';

interface SplitViewProps {
  content: string;
  onContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onImageClick?: (src: string) => void;
  onEditorScroll?: () => void;
  onPreviewScroll?: () => void;
  isMobile?: boolean;
}

const SplitView: React.FC<SplitViewProps> = ({
  content,
  onContentChange,
  onImageClick,
  onEditorScroll,
  onPreviewScroll,
  isMobile = false
}) => {
  if (isMobile) {
    return (
      <div className="flex flex-col space-y-4 relative">
        <EditorView
          content={content}
          onContentChange={onContentChange}
          onScroll={onEditorScroll}
          className="h-48"
        />
        <div 
          data-preview
          onScroll={onPreviewScroll}
          className="w-full p-4 border border-border rounded-lg bg-card text-foreground h-48 overflow-y-auto"
        >
          <MarkdownPreview content={content} onImageClick={onImageClick} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <EditorView
        content={content}
        onContentChange={onContentChange}
        onScroll={onEditorScroll}
      />
      <div 
        data-preview
        onScroll={onPreviewScroll}
        className="p-4 border border-border rounded-lg bg-card text-foreground h-screen overflow-y-auto"
      >
        <MarkdownPreview content={content} onImageClick={onImageClick} />
      </div>
    </div>
  );
};

export default SplitView; 