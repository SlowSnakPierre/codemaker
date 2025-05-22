import React, { createContext, useContext, useState, useCallback } from 'react';
import { fileService } from '@/services/file-service';
import { directoryService } from '@/services/directory-service';
import { FileData } from '@/core/types';

interface FileSystemContextType {
  currentDirectory: string | null;
  openDirectory: () => Promise<void>;
  closeDirectory: () => void;
  readFile: (path: string) => Promise<string | null>;
  saveFile: (path: string, content: string) => Promise<boolean>;
  // ...other methods and properties
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);

  const openDirectory = useCallback(async () => {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const dirPath = await window.electron.openDirectory();
        if (dirPath) {
          setCurrentDirectory(dirPath);
          // Additional logic...
        }
      } catch (error) {
        console.error("Error opening directory:", error);
      }
    }
  }, []);

  // Other methods...

  const value = {
    currentDirectory,
    openDirectory,
    closeDirectory,
    readFile: fileService.readFile,
    saveFile: fileService.saveFile,
    // ...other
  };

  return (
    <FileSystemContext.Provider value={value}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = (): FileSystemContextType => {
  const context = useContext(FileSystemContext);

  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }

  return context;
};
