'use client';

import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';

export type SortOption = 'date-desc' | 'date-asc' | 'lastModified';

interface PostSortProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export default function PostSort({ currentSort, onSortChange }: PostSortProps) {
  const { t } = useI18n();
  const sortOptions = [
    { value: 'date-desc', label: t('sort_latest') },
    { value: 'date-asc', label: t('sort_earliest') },
    { value: 'lastModified', label: t('sort_modified') },
  ] as const;

  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm text-muted-foreground">{t('sort_title')}</span>
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