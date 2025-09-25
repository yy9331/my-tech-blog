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
  editorRef?: React.RefObject<HTMLDivElement | null>;
  previewRef?: React.RefObject<HTMLDivElement | null>;
  onUndo?: () => void;
  onRedo?: () => void;
}

const SplitView: React.FC<SplitViewProps> = ({
  content,
  onContentChange,
  onImageClick,
  onEditorScroll,
  onPreviewScroll,
  isMobile = false,
  editorRef,
  previewRef
}) => {
  if (isMobile) {
    return (
      <div className="flex flex-col space-y-4 relative">
        <div ref={editorRef}>
          <EditorView
            content={content}
            onContentChange={onContentChange}
            onScroll={onEditorScroll}
            className="h-[50vh]"
          />
        </div>
        <div 
          ref={previewRef}
          data-preview
          onScroll={onPreviewScroll}
          className="w-full p-4 border border-border rounded-lg bg-card text-foreground h-[40vh] overflow-y-auto"
        >
          <MarkdownPreview content={content} onImageClick={onImageClick} />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full min-h-0">
      <div ref={editorRef} className="min-h-0">
        <EditorView
          content={content}
          onContentChange={onContentChange}
          onScroll={onEditorScroll}
        />
      </div>
      <div 
        ref={previewRef}
        data-preview
        onScroll={onPreviewScroll}
        className="p-4 border border-border rounded-lg bg-card text-foreground h-full min-h-0 overflow-y-auto"
      >
        <MarkdownPreview content={content} onImageClick={onImageClick} />
      </div>
    </div>
  );
};

export default SplitView; 