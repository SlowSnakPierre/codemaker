import React, { createContext, useContext, useState } from 'react';

interface EditorContextType {
  cursorPosition: { line: number; column: number };
  modifications: string[];
  updateCursorPosition: (line: number, column: number) => void;
  addModification: (modification: string) => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  const [modifications, setModifications] = useState<string[]>([]);

  const updateCursorPosition = (line: number, column: number) => {
    setCursorPosition({ line, column });
  };

  const addModification = (modification: string) => {
    setModifications((prevModifications) => [...prevModifications, modification]);
  };

  const value = {
    cursorPosition,
    modifications,
    updateCursorPosition,
    addModification,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);

  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }

  return context;
};
