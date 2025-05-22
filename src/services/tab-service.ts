import { FileTab } from "@/lib/types";

export const tabService = {
  openTab: (tabs: FileTab[], fileData: { path: string; content: string; name: string; language: string }): FileTab[] => {
    const newTab: FileTab = {
      id: `tab-${Date.now()}`,
      name: fileData.name,
      path: fileData.path,
      content: fileData.content,
      originalContent: fileData.content,
      language: fileData.language,
      active: true,
      modified: false,
    };

    return [...tabs.map((tab) => ({ ...tab, active: false })), newTab];
  },

  closeTab: (tabs: FileTab[], tabId: string): FileTab[] => {
    const isActiveTab = tabs.find((tab) => tab.id === tabId)?.active;

    const filteredTabs = tabs.filter((tab) => tab.id !== tabId);

    if (isActiveTab && filteredTabs.length > 0) {
      const newActiveIndex = Math.min(
        tabs.findIndex((tab) => tab.id === tabId),
        filteredTabs.length - 1
      );
      filteredTabs[newActiveIndex].active = true;
    }

    return filteredTabs;
  },

  switchTab: (tabs: FileTab[], tabId: string): FileTab[] => {
    return tabs.map((tab) => ({
      ...tab,
      active: tab.id === tabId,
    }));
  },
};
