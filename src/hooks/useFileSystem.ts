import { useState, useCallback } from 'react';
import { fileService } from '@/services/file-service';
import { directoryService } from '@/services/directory-service';

export function useFileSystem() {
  const [currentDirectory, setCurrentDirectory] = useState<string | null>(null);

  const openDirectory = useCallback(async () => {
    const dirPath = await directoryService.openDirectory();
    if (dirPath) {
      setCurrentDirectory(dirPath);
    }
  }, []);

  const readFile = useCallback(async (path: string) => {
    return await fileService.readFile(path);
  }, []);

  const saveFile = useCallback(async (path: string, content: string) => {
    return await fileService.saveFile(path, content);
  }, []);

  const createFile = useCallback(async (directory: string, filename: string) => {
    return await fileService.createFile(directory, filename);
  }, []);

  const navigateDirectory = useCallback(async (path: string) => {
    return await directoryService.navigateDirectory(path);
  }, []);

  const refreshDirectory = useCallback(async (path: string) => {
    return await directoryService.refreshDirectory(path);
  }, []);

  return {
    currentDirectory,
    openDirectory,
    readFile,
    saveFile,
    createFile,
    navigateDirectory,
    refreshDirectory,
  };
}
