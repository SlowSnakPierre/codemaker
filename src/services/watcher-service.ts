export const watcherService = {
  async startWatcher(directory: string): Promise<boolean> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const result = await window.electron.restartWatcher(directory);
        return result;
      } catch (error) {
        console.error("Error starting watcher:", error);
        return false;
      }
    }
    return false;
  },

  async stopWatcher(): Promise<void> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        await window.electron.stopWatcher();
      } catch (error) {
        console.error("Error stopping watcher:", error);
      }
    }
  }
};
