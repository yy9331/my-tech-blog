'use client'
import React from 'react';
import { useI18n } from '@/lib/i18n';

interface SaveButtonProps {
  isSaving: boolean;
  isMobile?: boolean;
}

const SaveButton: React.FC<SaveButtonProps> = ({ isSaving, isMobile = false }) => {
  const { t } = useI18n();
  if (isMobile) {
    return (
      <button
        type="submit"
        className="fixed bottom-6 right-6 z-50 px-8 py-4 rounded-full bg-sky-600 hover:bg-sky-500 text-white text-lg font-bold shadow-lg transition-colors disabled:opacity-60"
        disabled={isSaving}
      >
        {isSaving ? t('saving') : t('save')}
      </button>
    );
  }

  return (
    <button
      type="submit"
      className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors disabled:opacity-60"
      disabled={isSaving}
    >
      {isSaving ? t('saving') : t('save')}
    </button>
  );
};

export default SaveButton; 