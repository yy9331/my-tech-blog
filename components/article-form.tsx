'use client'
import React from 'react';
import TagsMultiSelect from '@/components/tags-multiselect';
import ImageUploader from '@/components/image-uploader';

interface ArticleFormProps {
  title: string;
  date: string;
  author: string;
  readTime: number | '';
  tags: string[];
  availableTags: string[];
  tagsLoading: boolean;
  editSlug: string | null;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onReadTimeChange: (value: number | '') => void;
  onTagsChange: (value: string[]) => void;
  onNewTagCreated: (tag: string) => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
  title,
  date,
  author,
  readTime,
  tags,
  availableTags,
  tagsLoading,
  editSlug,
  onTitleChange,
  onDateChange,
  onAuthorChange,
  onReadTimeChange,
  onTagsChange,
  onNewTagCreated,
}) => {
  return (
    <div className="p-6 bg-card rounded-b-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-muted-foreground mb-1">标题</label>
          <input
            type="text"
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="w-full p-3 rounded-lg bg-muted border border-border text-foreground focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
            placeholder="请输入文章标题"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">日期</label>
          <input
            type="date"
            value={date}
            onChange={e => onDateChange(e.target.value)}
            className="w-full p-3 rounded-lg bg-muted border border-border text-foreground focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">作者</label>
          <input
            type="text"
            value={author}
            onChange={e => onAuthorChange(e.target.value)}
            className="w-full p-3 rounded-lg bg-muted border border-border text-foreground focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
            placeholder="请输入作者名"
          />
        </div>
        <div>
          <label className="block text-muted-foreground mb-1">预计阅读时间(分钟)</label>
          <input
            type="number"
            min={1}
            value={readTime}
            onChange={e => onReadTimeChange(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full p-3 rounded-lg bg-muted border border-border text-foreground focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
            placeholder="如：5"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-muted-foreground mb-1">标签</label>
          <TagsMultiSelect
            options={availableTags}
            value={tags}
            onChange={onTagsChange}
            onNewTagCreated={onNewTagCreated}
            placeholder="请选择或输入标签"
            loading={tagsLoading}
          />
          <div className="mt-2 text-sm text-sky-400">可多选，输入或选择后回车/点击添加</div>
        </div>
        <div className="md:col-span-2">
          <ImageUploader editSlug={editSlug} />
        </div>
      </div>
    </div>
  );
};

export default ArticleForm; 