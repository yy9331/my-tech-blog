import { useState, useCallback, useEffect, useRef } from 'react';

export function useEditorHotkeys(initialContent: string = '') {
  const [content, setContent] = useState(initialContent);
  const [history, setHistory] = useState<string[]>([initialContent]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 推入历史
  const pushHistory = useCallback((newValue: string) => {
    setHistory(prev => {
      if (prev[prev.length - 1] === newValue) return prev;
      return [...prev, newValue];
    });
    setRedoStack([]);
  }, []);

  // 撤销
  const undo = useCallback(() => {
    if (history.length <= 1) return;
    const newHistory = history.slice(0, -1);
    const last = history[history.length - 1];
    const prevValue = history[history.length - 2];
    setHistory(newHistory);
    setRedoStack([last, ...redoStack]);
    setContent(prevValue);
  }, [history, redoStack]);

  // 重做
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[0];
    setRedoStack(redoStack.slice(1));
    setHistory([...history, next]);
    setContent(next);
  }, [history, redoStack]);

  // 统一内容变更处理
  const handleContentChange = useCallback((eOrValue: React.ChangeEvent<HTMLTextAreaElement> | string) => {
    const value = typeof eOrValue === 'string' ? eOrValue : eOrValue.target.value;
    setContent(value);
    pushHistory(value);
  }, [pushHistory]);

  // 快捷键处理
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 撤销/重做
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const undoKey = (isMac ? e.metaKey : e.ctrlKey) && e.key === 'z' && !e.shiftKey;
    const redoKey = (isMac ? e.metaKey : e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y');
    if (!isComposing && undoKey) {
      e.preventDefault();
      undo();
      return;
    }
    if (!isComposing && redoKey) {
      e.preventDefault();
      redo();
      return;
    }
    // 包裹快捷键
    const wrapKeys: Record<string, string> = {
      '`': '`',
      '"': '"',
      "'": "'",
      '*': '*',
    };
    const textarea = e.currentTarget;
    if (wrapKeys[e.key] && textarea.selectionStart !== textarea.selectionEnd) {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);
      const wrapChar = wrapKeys[e.key];
      const wrapped = wrapChar + selected + wrapChar;
      const newValue = before + wrapped + after;
      setContent(newValue);
      pushHistory(newValue);
      setTimeout(() => {
        textarea.setSelectionRange(start + 1, end + 1);
        textarea.focus();
      }, 0);
      return;
    }
    // /语言+Tab 代码块
    if (e.key === 'Tab') {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const beforeCursor = value.substring(0, start);
      const lastSlashIndex = beforeCursor.lastIndexOf('/');
      if (lastSlashIndex !== -1) {
        const afterSlash = beforeCursor.substring(lastSlashIndex + 1);
        const languageMatch = afterSlash.match(/^([a-zA-Z0-9+#]+)/);
        if (languageMatch) {
          e.preventDefault();
          const language = languageMatch[1];
          const replaceStart = lastSlashIndex;
          const codeBlock = `\`\`\`${language}\n\n\`\`\``;
          const newValue = value.substring(0, replaceStart) + codeBlock + value.substring(end);
          setContent(newValue);
          pushHistory(newValue);
          const newCursorPosition = replaceStart + codeBlock.length - 4;
          setTimeout(() => {
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
            textarea.focus();
          }, 0);
          return;
        }
      }
      // 普通Tab
      e.preventDefault();
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      setContent(newValue);
      pushHistory(newValue);
      const newCursorPosition = start + 2;
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);
    }
  }, [isComposing, undo, redo, pushHistory]);

  // 处理中文输入法合成
  useEffect(() => {
    const handleCompositionStart = () => setIsComposing(true);
    const handleCompositionEnd = () => setIsComposing(false);
    document.addEventListener('compositionstart', handleCompositionStart);
    document.addEventListener('compositionend', handleCompositionEnd);
    return () => {
      document.removeEventListener('compositionstart', handleCompositionStart);
      document.removeEventListener('compositionend', handleCompositionEnd);
    };
  }, []);

  // textareaRef 可选：用于外部控制光标

  return {
    content,
    setContent: (val: string) => { setContent(val); pushHistory(val); },
    handleContentChange,
    handleKeyDown,
    undo,
    redo,
    canUndo: history.length > 1,
    canRedo: redoStack.length > 0,
    textareaRef,
  };
} 