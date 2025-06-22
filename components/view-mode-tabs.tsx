'use client'
import React from 'react';

export type ViewMode = 'editor' | 'preview' | 'split';

interface ViewModeTabsProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewModeTabs: React.FC<ViewModeTabsProps> = ({ viewMode, onViewModeChange }) => {
  const modes: ViewMode[] = ['editor', 'preview', 'split'];
  
  return (
    <div className="flex space-x-4">
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          className={`px-4 py-2 border rounded transition-colors ${
            viewMode === mode 
              ? 'bg-sky-700 text-white border-sky-500' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onViewModeChange(mode)}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default ViewModeTabs; 