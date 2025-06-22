'use client'
import { useEffect } from 'react';

export const useSaveShortcut = (formRef: React.RefObject<HTMLDivElement | null>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const saveKeyPressed = (isMac ? event.metaKey : event.ctrlKey) && event.key === 's';

      if (saveKeyPressed) {
        event.preventDefault();
        const form = formRef.current?.closest('form');
        if (form) {
          form.requestSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [formRef]);
}; 