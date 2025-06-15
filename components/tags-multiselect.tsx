import React, { useRef, useState } from 'react';

interface TagsMultiSelectProps {
  options: string[];
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  onNewTagCreated?: (newTag: string) => void;
}

export default function TagsMultiSelect({ options, value, onChange, placeholder, onNewTagCreated }: TagsMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // 关闭下拉
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 过滤可选项
  const filteredOptions = options.filter(
    (tag) => tag.toLowerCase().includes(input.toLowerCase()) && !value.includes(tag)
  );

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim() !== '') {
      e.preventDefault();
      const newTag = input.trim();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
        if (onNewTagCreated) {
          onNewTagCreated(newTag);
        }
      }
      setInput('');
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="flex flex-wrap items-center gap-2 p-2 bg-gray-700 border border-gray-600 rounded-lg cursor-text min-h-[44px] focus-within:ring-2 focus-within:ring-sky-500"
        onClick={() => setOpen(true)}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center bg-sky-600 text-white rounded px-2 py-1 text-xs mr-1 mb-1"
          >
            {tag}
            <button
              type="button"
              className="ml-1 text-white hover:text-sky-200 focus:outline-none"
              onClick={e => {
                e.stopPropagation();
                onChange(value.filter(t => t !== tag));
              }}
            >
              ×
            </button>
          </span>
        ))}
        <input
          className="flex-1 bg-transparent outline-none text-gray-200 placeholder-gray-400 min-w-[80px]"
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder || '请选择/输入标签'}
        />
      </div>
      {open && filteredOptions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 bg-gray-800 border border-gray-600 rounded-b-lg mt-1 max-h-40 overflow-auto shadow-lg">
          {filteredOptions.map(tag => (
            <li
              key={tag}
              className="px-4 py-2 cursor-pointer hover:bg-sky-600 hover:text-white text-gray-200"
              onClick={() => {
                onChange([...value, tag]);
                setInput('');
                setOpen(false);
              }}
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 