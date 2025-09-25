'use client'
import React, { useRef, useCallback } from 'react';
import { useI18n } from '@/lib/i18n';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useI18n();

  // 处理键盘事件，实现代码块快捷输入和快捷包裹
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    
    // 1. Tab 选中时整段缩进两格
    if (e.key === 'Tab' && start !== end && !e.shiftKey) {
      e.preventDefault();
      // 获取选中行的起止
      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);
      // 每行前加两个空格
      const indented = selected.replace(/(^|\n)/g, '$1  ');
      const newValue = before + indented + after;
      const syntheticEvent = { target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>;
      onContentChange(syntheticEvent);
      setTimeout(() => {
        textarea.setSelectionRange(start + 2, end + 2 * (selected.match(/\n/g)?.length ?? 0) + 2);
        textarea.focus();
      }, 0);
      return;
    }
    
    // 2. Shift + Tab 选中时整段向左缩进两格
    if (e.key === 'Tab' && start !== end && e.shiftKey) {
      e.preventDefault();
      // 获取选中行的起止
      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);
      // 每行前移除两个空格（如果存在）
      const unindented = selected.replace(/(^|\n)  /g, '$1');
      const newValue = before + unindented + after;
      const syntheticEvent = { target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>;
      onContentChange(syntheticEvent);
      setTimeout(() => {
        textarea.setSelectionRange(start, end - (selected.length - unindented.length));
        textarea.focus();
      }, 0);
      return;
    }
    // 2. 选中时按 (, [, { 包裹选中内容
    const bracketMap: Record<string, [string, string]> = {
      '(': ['(', ')'],
      '[': ['[', ']'],
      '{': ['{', '}'],
    };
    if (bracketMap[e.key] && start !== end) {
      e.preventDefault();
      const [left, right] = bracketMap[e.key];
      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);
      const wrapped = left + selected + right;
      const newValue = before + wrapped + after;
      const syntheticEvent = { target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>;
      onContentChange(syntheticEvent);
      setTimeout(() => {
        textarea.setSelectionRange(start + 1, end + 1);
        textarea.focus();
      }, 0);
      return;
    }
    // 3. Cmd/Ctrl+X 剪切整行
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if ((isMac ? e.metaKey : e.ctrlKey) && e.key.toLowerCase() === 'x' && start === end) {
      // 剪切整行
      e.preventDefault();
      const lines = value.split('\n');
      let charCount = 0;
      let lineIdx = 0;
      for (; lineIdx < lines.length; lineIdx++) {
        if (charCount + lines[lineIdx].length >= start) break;
        charCount += lines[lineIdx].length + 1;
      }
      const lineStart = charCount;
      const lineEnd = charCount + lines[lineIdx].length;
      const before = value.slice(0, lineStart);
      const after = value.slice(lineEnd + 1); // +1 跳过换行
      const newValue = before + (after ? '\n' + after : '');
      // 复制到剪贴板
      navigator.clipboard.writeText(lines[lineIdx] + '\n');
      const syntheticEvent = { target: { value: newValue } } as React.ChangeEvent<HTMLTextAreaElement>;
      onContentChange(syntheticEvent);
      setTimeout(() => {
        textarea.setSelectionRange(lineStart, lineStart);
        textarea.focus();
      }, 0);
      return;
    }
    // ...原有包裹和Tab逻辑...
    const wrapKeys: Record<string, string> = {
      '`': '`',
      '"': '"',
      "'": "'",
      '*': '*',
    };
    if (wrapKeys[e.key] && start !== end) {
      e.preventDefault();
      const before = value.slice(0, start);
      const selected = value.slice(start, end);
      const after = value.slice(end);
      const wrapChar = wrapKeys[e.key];
      const wrapped = wrapChar + selected + wrapChar;
      const newValue = before + wrapped + after;
      const syntheticEvent = {
        target: {
          value: newValue
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onContentChange(syntheticEvent);
      setTimeout(() => {
        textarea.setSelectionRange(start + 1, end + 1);
        textarea.focus();
      }, 0);
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      // 检查是否为代码块快捷键：/xxx + Tab
      if (start === end) { // 无选中文本时才处理代码块快捷键
      const beforeCursor = value.substring(0, start);
        const match = beforeCursor.match(/\/([a-zA-Z0-9+#]+)$/);
        if (match) {
          const language = match[1];
          const replaceStart = start - match[0].length;
          // 插入标准 markdown 代码块
          const codeBlock = `\`\`\`${language}\n\n\`\`\``;
          const newValue = value.substring(0, replaceStart) + codeBlock + value.substring(end);
          const syntheticEvent = {
            target: {
              value: newValue
            }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          onContentChange(syntheticEvent);
          // 光标定位到代码块内部
          const cursorPos = replaceStart + codeBlock.indexOf('\n') + 1;
          setTimeout(() => {
            textarea.setSelectionRange(cursorPos, cursorPos);
            textarea.focus();
          }, 0);
          return;
        }
      }
      // 普通 Tab 缩进
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      const syntheticEvent = {
        target: {
          value: newValue
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      onContentChange(syntheticEvent);
      const newCursorPosition = start + 2;
      setTimeout(() => {
        textarea.setSelectionRange(newCursorPosition, newCursorPosition);
        textarea.focus();
      }, 0);
    }
  }, [onContentChange]);

  return (
    <textarea
      ref={textareaRef}
      data-editor
      onScroll={onScroll}
      onKeyDown={handleKeyDown}
      className={`w-full h-full min-h-0 p-4 border border-border rounded-lg bg-card text-foreground ${className}`}
      value={content}
      onChange={onContentChange}
      placeholder={placeholder || t('editor_placeholder')}
    />
  );
};

export default EditorView; 