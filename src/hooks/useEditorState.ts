import { useState } from 'react';

interface EditorState {
  cursorPosition: { line: number; column: number };
  modifications: string[];
}

export function useEditorState() {
  const [editorState, setEditorState] = useState<EditorState>({
    cursorPosition: { line: 1, column: 1 },
    modifications: [],
  });

  const updateCursorPosition = (line: number, column: number) => {
    setEditorState((prevState) => ({
      ...prevState,
      cursorPosition: { line, column },
    }));
  };

  const addModification = (modification: string) => {
    setEditorState((prevState) => ({
      ...prevState,
      modifications: [...prevState.modifications, modification],
    }));
  };

  return {
    editorState,
    updateCursorPosition,
    addModification,
  };
}
