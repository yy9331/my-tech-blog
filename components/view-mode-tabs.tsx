'use client'
import React from 'react';
import { useI18n } from '@/lib/i18n';

export type ViewMode = 'preview' | 'split' | 'save-and-preview';

interface ViewModeTabsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPreviewPage?: () => void;
  isEditing?: boolean;
}

const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ viewMode, onViewModeChange, onPreviewPage, isEditing = false }) => {
  const { t } = useI18n();
  const modes: ViewMode[] = isEditing ? ['preview', 'split', 'save-and-preview'] : ['preview', 'split'];
  
  const handleModeClick = (mode: ViewMode) => {
    if (mode === 'save-and-preview' && onPreviewPage) {
      onPreviewPage();
    } else {
      onViewModeChange(mode);
    }
  };

  const getModeLabel = (mode: ViewMode) => {
    switch (mode) {
      case 'preview':
        return t('tabs_preview');
      case 'split':
        return t('tabs_split');
      case 'save-and-preview':
        return t('tabs_save_and_preview');
    }
  };
  
  return (
    <div className="flex space-x-4">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          className={`px-4 py-2 border rounded transition-colors ${
            viewMode === mode 
              ? 'bg-sky-700 text-white border-sky-500' 
              : 'bg-card text-foreground border-border hover:bg-accent'
          }`}
          onClick={() => handleModeClick(mode)}
        >
          {getModeLabel(mode)}
        </button>
      ))}
    </div>
  );
};

export default ViewModeTabs; 