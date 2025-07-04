'use client'
import React from 'react';
import ArticleForm from '@/components/article-form';

interface CollapsibleFormProps {
  collapsed: boolean;
  isEditing: boolean;
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
  onCollapsedChange: (collapsed: boolean) => void;
  onTitleChange: (value: string) => void;
  onDateChange: (value: string) => void;
  onAuthorChange: (value: string) => void;
  onReadTimeChange: (value: number | '') => void;
  onTagsChange: (value: string[]) => void;
  onNewTagCreated: (tag: string) => void;
}

const CollapsibleForm: React.FC<CollapsibleFormProps> = ({
  collapsed,
  isEditing,
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
  onCollapsedChange,
  onTitleChange,
  onDateChange,
  onAuthorChange,
  onReadTimeChange,
  onTagsChange,
  onNewTagCreated,
}) => {
  return (
    <div className="mb-6 mt-[66px]">
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-t-lg bg-sky-700 hover:bg-sky-600 text-white font-semibold transition-colors w-full justify-between"
        onClick={e => { e.preventDefault(); onCollapsedChange(!collapsed); }}
        type="button"
      >
        <span>{isEditing ? '编辑文章信息' : '文章信息设置'}</span>
        <svg
          className={`w-5 h-5 transform transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-500 ease-in-out ${
          collapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-[800px] opacity-100 overflow-visible'
        }`}
      >
        <ArticleForm
          title={title}
          date={date}
          author={author}
          readTime={readTime}
          tags={tags}
          availableTags={availableTags}
          tagsLoading={tagsLoading}
          editSlug={editSlug}
          githubUrl={githubUrl}
          onGithubUrlChange={onGithubUrlChange}
          onTitleChange={onTitleChange}
          onDateChange={onDateChange}
          onAuthorChange={onAuthorChange}
          onReadTimeChange={onReadTimeChange}
          onTagsChange={onTagsChange}
          onNewTagCreated={onNewTagCreated}
        />
      </div>
    </div>
  );
};

export default CollapsibleForm; 