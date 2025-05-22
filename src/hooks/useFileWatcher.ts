import { useState, useEffect, useCallback } from 'react';
import { watcherService } from '@/services/watcher-service';

export function useFileWatcher(directory: string | null) {
  const [watcherActive, setWatcherActive] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  const checkWatcherStatus = useCallback(async () => {
    if (!directory) {
      setWatcherActive(false);
      return;
    }

    setChecking(true);

    try {
      const result = await watcherService.startWatcher(directory);
      setWatcherActive(result);
    } catch (error) {
      console.error("Error checking watcher status:", error);
      setWatcherActive(false);
    } finally {
      setChecking(false);
    }
  }, [directory]);

  useEffect(() => {
    checkWatcherStatus();

    const interval = setInterval(() => {
      checkWatcherStatus();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [checkWatcherStatus]);

  const forceRestartWatcher = useCallback(async () => {
    if (!directory) return;

    setChecking(true);
    try {
      const result = await watcherService.startWatcher(directory);
      setWatcherActive(result);
    } catch (error) {
      console.error("Error forcing watcher restart:", error);
      setWatcherActive(false);
    } finally {
      setChecking(false);
    }
  }, [directory]);

  return {
    watcherActive,
    checking,
    checkWatcherStatus,
    forceRestartWatcher,
  };
}
