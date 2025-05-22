export const fileService = {
  async readFile(path: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const content = await window.electron.readFile(path);
        return content;
      } catch (error) {
        console.error("Error reading file:", error);
        return null;
      }
    }
    return null;
  },

  async saveFile(path: string, content: string): Promise<string | null> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const savedPath = await window.electron.saveFile({ path, content });
        return savedPath;
      } catch (error) {
        console.error("Error saving file:", error);
        return null;
      }
    }
    return null;
  },

  async createFile(directory: string, filename: string): Promise<boolean> {
    if (typeof window !== 'undefined' && window.electron) {
      try {
        const result = await window.electron.createFile({ dirPath: directory, fileName: filename });
        return result.success;
      } catch (error) {
        console.error("Error creating file:", error);
        return false;
      }
    }
    return false;
  }
};
