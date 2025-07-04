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
  githubUrl: string;
  onGithubUrlChange: (value: string) => void;
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
  githubUrl,
  onGithubUrlChange,
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
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
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
          <div>
            <label className="block text-muted-foreground mb-1 flex items-center">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.339-2.221-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.337 4.695-4.566 4.944.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.749 0 .267.18.577.688.48C19.138 20.203 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
              GitHub 链接
            </label>
            <input
              type="url"
              value={githubUrl}
              onChange={e => onGithubUrlChange(e.target.value)}
              className="w-full p-3 rounded-lg bg-muted border border-border text-foreground focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
              placeholder="可选，填写关联的 GitHub 仓库或文件地址"
            />
          </div>
        </div>
        <div className="md:col-span-2">
          <ImageUploader editSlug={editSlug} />
        </div>
      </div>
    </div>
  );
};

export default ArticleForm; 