'use client'
import { useRef, useCallback } from 'react';

export const useScrollSync = () => {
  const activeScroller = useRef<'editor' | 'preview' | null>(null);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const syncScroll = useCallback((source: 'editor' | 'preview') => {
    if (activeScroller.current && activeScroller.current !== source) {
      return;
    }
    activeScroller.current = source;

    const editor = document.querySelector('[data-editor]') as HTMLElement;
    const preview = document.querySelector('[data-preview]') as HTMLElement;

    if (!editor || !preview) return;

    if (source === 'editor') {
      const editorScrollHeight = editor.scrollHeight - editor.clientHeight;
      if (editorScrollHeight > 0) {
        const percentage = editor.scrollTop / editorScrollHeight;
        preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
      }
    } else {
      const previewScrollHeight = preview.scrollHeight - preview.clientHeight;
      if (previewScrollHeight > 0) {
        const percentage = preview.scrollTop / previewScrollHeight;
        editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
      }
    }

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }
    
    scrollTimeout.current = setTimeout(() => {
      activeScroller.current = null;
    }, 100);
  }, []);

  return { syncScroll };
}; 