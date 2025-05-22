export const directoryService = {
  async openDirectory(): Promise<string | null> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const dirPath = await window.electron.openDirectory();
        return dirPath;
      } catch (error) {
        console.error("Error opening directory:", error);
        return null;
      }
    }
    return null;
  },

  async navigateDirectory(path: string): Promise<ReadDirectory[] | null> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const contents = await window.electron.readDirectory(path);
        return contents;
      } catch (error) {
        console.error("Error navigating directory:", error);
        return null;
      }
    }
    return null;
  },

  async refreshDirectory(path: string): Promise<RefreshDirectoryResult> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const result = await window.electron.refreshDirectory(path);
        return result;
      } catch (error) {
        console.error("Error refreshing directory:", error);
        return { success: false, message: "Error refreshing directory" };
      }
    }
    return { success: false, message: "Electron not available" };
  }
};
