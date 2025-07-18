'use client';

import { motion } from 'framer-motion';

export type SortOption = 'date-desc' | 'date-asc' | 'lastModified';

interface PostSortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function PostSort({ currentSort, onSortChange }: PostSortProps) {
  const sortOptions = [
    { value: 'date-desc', label: '最新发布' },
    { value: 'date-asc', label: '最早发布' },
    { value: 'lastModified', label: '最近修改' },
  ] as const;

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">排序方式：</span>
      <div className="flex gap-2">
        {sortOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors shadow-xl ${
              currentSort === option.value
                ? 'bg-sky-600 text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
            whileHover={{ scale: 1.10 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
} 