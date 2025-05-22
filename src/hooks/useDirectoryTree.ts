import { useState, useCallback } from 'react';
import { directoryService } from '@/services/directory-service';

export function useDirectoryTree() {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path],
    }));
  }, []);

  const openDirectory = useCallback(async (path: string) => {
    const contents = await directoryService.navigateDirectory(path);
    if (contents) {
      setExpandedFolders(prev => ({
        ...prev,
        [path]: true,
      }));
    }
    return contents;
  }, []);

  const refreshDirectory = useCallback(async (path: string) => {
    const result = await directoryService.refreshDirectory(path);
    if (result.success) {
      setExpandedFolders(prev => ({
        ...prev,
        [path]: true,
      }));
    }
    return result;
  }, []);

  return {
    expandedFolders,
    toggleFolder,
    openDirectory,
    refreshDirectory,
  };
}
