import React, { createContext, useContext, useState } from 'react';

type EditorContextType = {
  content: string;
  setContent: (content: string) => void;
  isSaving: boolean;
  setIsSaving: (isSaving: boolean) => void;
  saveSuccess: string | null;
  setSaveSuccess: (message: string | null) => void;
  saveError: string | null;
  setSaveError: (message: string | null) => void;
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export const EditorProvider = ({ children }: { children: React.ReactNode }) => {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  return (
    <EditorContext.Provider value={{ content, setContent, isSaving, setIsSaving, saveSuccess, setSaveSuccess, saveError, setSaveError }}>
      {children}
    </EditorContext.Provider>
  );
}; 