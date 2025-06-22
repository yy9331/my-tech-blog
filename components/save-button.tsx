'use client'
import React from 'react';

interface SaveButtonProps {
  isSaving: boolean;
  isMobile?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ isSaving, isMobile = false }) => {
  if (isMobile) {
    return (
      <button
        type="submit"
        className="fixed bottom-6 right-6 z-50 px-8 py-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-lg font-bold shadow-lg transition-colors disabled:opacity-60"
        disabled={isSaving}
      >
        {isSaving ? '保存中...' : '保存'}
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors disabled:opacity-60"
      disabled={isSaving}
    >
      {isSaving ? '保存中...' : '保存'}
    </button>
  );
};

export default SaveButton; 