'use client';

import React, { useState, useEffect } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
  isMobile?: boolean;
  isTocCollapsed?: boolean;
  onTocCollapsed?: (collapsed: boolean) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ 
  content, 
  className = '', 
  isMobile = false, 
  isTocCollapsed = false,
  onTocCollapsed 
}) => {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(!isMobile);
  const [isHovered, setIsHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isTocCollapsed);

  // 提取标题并生成目录
  useEffect(() => {
    const extractHeadings = (markdown: string): TocItem[] => {
      const lines = markdown.split('\n');
      const headings: TocItem[] = [];
      const idCounts: { [key: string]: number } = {};
      let inCodeBlock = false;
      let codeBlockLanguage = '';
      
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        
        // 检查是否进入或退出代码块
        const codeBlockStart = trimmedLine.match(/^```(\w+)?$/);
        if (codeBlockStart) {
          if (!inCodeBlock) {
            // 进入代码块
            inCodeBlock = true;
            codeBlockLanguage = codeBlockStart[1] || '';
          } else {
            // 退出代码块
            inCodeBlock = false;
            codeBlockLanguage = '';
          }
          return; // 跳过代码块标记行
        }
        
        // 如果在代码块内，跳过所有内容
        if (inCodeBlock) {
          return;
        }
        
        // 检查是否是标题（不在代码块内）
        // 确保#号前面没有其他字符（除了空格）
        const headingMatch = line.match(/^(\s*)(#{1,6})\s+(.+)$/);
        if (headingMatch) {
          const level = headingMatch[2].length;
          let text = headingMatch[3].trim();
          
          // 移除Markdown语法符号
          text = text
            .replace(/\*\*\*(.*?)\*\*\*/g, '$1') // 移除 ***text*** 格式
            .replace(/\*\*(.*?)\*\*/g, '$1')     // 移除 **text** 格式
            .replace(/\*(.*?)\*/g, '$1')         // 移除 *text* 格式
            .replace(/`(.*?)`/g, '$1')           // 移除 `text` 格式
            .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // 移除 [text](url) 格式
            .replace(/^\d+\.\s*/, '')            // 移除开头的数字和点，如 "1. "
            .replace(/^\d+\)\s*/, '')            // 移除开头的数字和括号，如 "1) "
            .trim();
          
          let baseId = text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // 移除特殊字符
            .replace(/\s+/g, '-') // 空格替换为连字符
            .replace(/-+/g, '-'); // 多个连字符替换为单个
          
          // 如果ID为空或已存在，使用索引作为后缀
          if (!baseId || idCounts[baseId]) {
            idCounts[baseId] = (idCounts[baseId] || 0) + 1;
            baseId = baseId || `heading-${index}`;
            baseId = `${baseId}-${idCounts[baseId]}`;
          } else {
            idCounts[baseId] = 1;
          }
          
          headings.push({ id: baseId, text, level });
        }
      });
      
      return headings;
    };

    const items = extractHeadings(content);
    setTocItems(items);
  }, [content]);

  // 监听滚动，更新当前活跃的标题
  useEffect(() => {
    const handleScroll = () => {
      const headings = tocItems.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
      
      if (headings.length === 0) return;

      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const offset = 120; // 考虑固定头部的高度

      let activeHeading = headings[0];
      
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        const rect = heading.getBoundingClientRect();
        
        if (rect.top <= offset) {
          activeHeading = heading;
          break;
        }
      }

      setActiveId(activeHeading.id);
    };

    if (tocItems.length > 0) {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // 初始检查
      
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [tocItems]);

  // 平滑滚动到指定标题
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  // 处理收缩状态变化
  const handleCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onTocCollapsed?.(collapsed);
  };

  if (tocItems.length === 0) {
    return null;
  }

  // 移动端固定定位的目录
  if (isMobile) {
    return (
      <div 
        className={`fixed bottom-6 right-4 z-40 ${className}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 目录图标按钮 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-14 h-14 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
          aria-label="目录"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </button>

        {/* 展开的目录内容 */}
        <div className={`absolute bottom-16 right-0 w-72 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 transition-all duration-300 ${
          isExpanded || isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
        }`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
              <h3 className="text-sm font-semibold text-gray-200">
                目录
              </h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
                aria-label="收起目录"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ul className="max-h-64 overflow-y-auto space-y-1">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      scrollToHeading(item.id);
                      setIsExpanded(false);
                    }}
                    className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                      activeId === item.id
                        ? 'text-sky-400 bg-sky-900/30 border-l-2 border-sky-400'
                        : 'text-gray-300 hover:text-sky-300 hover:bg-gray-700/50'
                    }`}
                    style={{ paddingLeft: `${(item.level - 1) * 8 + 8}px` }}
                  >
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 桌面端固定定位的目录
  return (
    <div 
      className={`fixed top-20 left-4 z-40 transition-all duration-300 ${className} ${
        isCollapsed ? 'w-12' : 'w-80'
      }`}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* 收缩/展开按钮 */}
      <button
        onClick={() => handleCollapsed(!isCollapsed)}
        className="absolute -right-3 top-2 w-6 h-6 bg-sky-600 hover:bg-sky-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
        aria-label={isCollapsed ? '展开目录' : '收起目录'}
      >
        <svg 
          className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* 目录内容 */}
      <div className={`bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 p-4 transition-all duration-300 ${
        isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
      }`}>
        <h3 className="text-lg font-semibold text-gray-200 mb-4 pb-2 border-b border-gray-700">
          目录
        </h3>
        <ul className="overflow-y-auto space-y-1" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
          {tocItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`w-full text-left px-2 py-1 rounded text-sm transition-colors ${
                  activeId === item.id
                    ? 'text-sky-400 bg-sky-900/30 border-l-2 border-sky-400'
                    : 'text-gray-300 hover:text-sky-300 hover:bg-gray-700/50'
                }`}
                style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* 收缩时显示的图标 */}
      <div className={`absolute top-4 left-4 transition-all duration-300 ${
        isCollapsed ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div className="w-12 h-12 bg-gray-800/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 flex items-center justify-center">
          <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default TableOfContents; 