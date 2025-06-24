'use client'
import React, { useRef, useCallback } from 'react';

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

  // 处理键盘事件，实现代码块快捷输入
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      
      // 检查光标前是否有 / 符号
      const beforeCursor = value.substring(0, start);
      const lastSlashIndex = beforeCursor.lastIndexOf('/');
      
      if (lastSlashIndex !== -1) {
        // 检查 / 后面是否有语言名称
        const afterSlash = beforeCursor.substring(lastSlashIndex + 1);
        const languageMatch = afterSlash.match(/^([a-zA-Z0-9+#]+)/);
        
        if (languageMatch) {
          const language = languageMatch[1];
          
          // 计算需要替换的文本范围
          const replaceStart = lastSlashIndex;
          
          // 生成代码块
          const codeBlock = `\`\`\`${language}\n\n\`\`\``;
          
          // 替换文本
          const newValue = value.substring(0, replaceStart) + codeBlock + value.substring(end);
          
          // 创建模拟的 change 事件
          const syntheticEvent = {
            target: {
              value: newValue
            }
          } as React.ChangeEvent<HTMLTextAreaElement>;
          
          onContentChange(syntheticEvent);
          
          // 设置光标位置到代码块中间
          const newCursorPosition = replaceStart + codeBlock.length - 4; // 减去末尾的 ```
          setTimeout(() => {
            textarea.setSelectionRange(newCursorPosition, newCursorPosition);
            textarea.focus();
          }, 0);
          
          return;
        }
      }
      
      // 如果没有匹配到代码块模式，插入普通的 Tab
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      const syntheticEvent = {
        target: {
          value: newValue
        }
      } as React.ChangeEvent<HTMLTextAreaElement>;
      
      onContentChange(syntheticEvent);
      
      // 设置光标位置
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
      className={`w-full p-4 border border-border rounded-lg bg-card text-foreground h-screen ${className}`}
      value={content}
      onChange={onContentChange}
      placeholder={placeholder}
    />
  );
};

export default EditorView; 