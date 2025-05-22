import { useCallback } from 'react';

export function useWindowControls() {
  const isElectron = typeof window !== 'undefined' && window.electron;

  const minimizeWindow = useCallback(() => {
    if (isElectron) {
      window.electron.minimizeWindow();
    }
  }, [isElectron]);

  const maximizeWindow = useCallback(async () => {
    if (isElectron) {
      const maximized = await window.electron.maximizeWindow();
      return maximized;
    }
    return false;
  }, [isElectron]);

  const closeWindow = useCallback(() => {
    if (isElectron) {
      window.electron.closeWindow();
    }
  }, [isElectron]);

  return {
    minimizeWindow,
    maximizeWindow,
    closeWindow,
  };
}
